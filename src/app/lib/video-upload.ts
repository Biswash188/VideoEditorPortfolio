import type { PutBlobResult } from "@vercel/blob";
import { upload } from "@vercel/blob/client";
import {
  createVideoBlobPath,
  type VideoProjectMetadata,
  validateVideoFile,
  videoProjectMetadataSchema,
} from "../../shared/video-upload.js";

export type UploadProgress = { loaded: number; total: number; percentage: number };

export type UploadPortfolioVideoOptions = {
  file: File;
  metadata: VideoProjectMetadata;
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
};

type UploadSession = {
  uploadSessionId: string;
  completionToken: string;
  googleDriveFolderId: string;
  chunkSize: number;
};

type GoogleTokenClient = {
  requestAccessToken: (options?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
          }) => GoogleTokenClient;
        };
      };
    };
  }
}

let googleIdentityScript: Promise<void> | undefined;

function loadGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  googleIdentityScript ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => window.google?.accounts?.oauth2
      ? resolve()
      : reject(new Error("Google Identity Services did not load."));
    script.onerror = () => reject(new Error("Could not load Google Identity Services."));
    document.head.append(script);
  });
  return googleIdentityScript;
}

async function getGoogleDriveAccessToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not configured for direct Google Drive uploads.");
  await loadGoogleIdentityServices();
  return new Promise((resolve, reject) => {
    const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
      client_id: clientId,
      // drive.file limits the browser token to files created through this app.
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (response) => response.access_token
        ? resolve(response.access_token)
        : reject(new Error(response.error_description || response.error || "Google Drive authorization was cancelled.")),
    });
    if (!tokenClient) return reject(new Error("Google Identity Services is unavailable."));
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

async function createBrowserDriveUploadSession(
  file: File,
  contentType: string,
  folderId: string,
): Promise<{ uploadUrl: string; accessToken: string }> {
  const accessToken = await getGoogleDriveAccessToken();
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": contentType,
      "X-Upload-Content-Length": String(file.size),
    },
    body: JSON.stringify({ name: file.name, mimeType: contentType, parents: [folderId] }),
  });
  const uploadUrl = response.headers.get("Location");
  if (!response.ok || !uploadUrl) throw new Error("Could not start the browser-to-Google Drive upload.");
  return { uploadUrl, accessToken };
}

/**
 * A Drive upload is not part of the portfolio until this request succeeds.
 * Checking the response body (rather than only its 2xx status) avoids showing
 * a false success when a proxy or development server returns an HTML fallback.
 */
async function completePortfolioVideoUpload(
  session: Pick<UploadSession, "uploadSessionId" | "completionToken">,
  googleDriveFileId: string,
  signal?: AbortSignal,
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch("/api/videos/complete", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uploadSessionId: session.uploadSessionId,
          completionToken: session.completionToken,
          googleDriveFileId,
        }),
        signal,
      });
      const body = await response.json().catch(() => undefined) as
        | { completed?: boolean; error?: { message?: string } }
        | undefined;

      if (response.ok && body?.completed === true) return;
      // Client mistakes (for example, an expired session) cannot recover with
      // a retry. Server failures and transient network failures can.
      if (response.status < 500) {
        const error = new Error(body?.error?.message || "Portfolio finalization was rejected.") as Error & { retryable?: boolean };
        error.retryable = false;
        throw error;
      }
      lastError = new Error(body?.error?.message || "Portfolio finalization temporarily failed.");
    } catch (error) {
      if (signal?.aborted) throw error;
      if ((error as { retryable?: boolean }).retryable === false) throw error;
      lastError = error;
    }
    if (attempt < 4) await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Google Drive upload succeeded, but portfolio finalization failed. Keep this browser open and retry the completion request.");
}

/**
 * Sends video bytes directly to Google Drive. Only metadata ever goes through
 * this app's API. File.slice keeps multi-GB files out of JS heap memory.
 */
export async function uploadPortfolioVideo({
  file,
  metadata,
  signal,
  onProgress,
}: UploadPortfolioVideoOptions): Promise<void> {
  const validatedMetadata = videoProjectMetadataSchema.parse(metadata);
  const { contentType } = validateVideoFile(file);
  const sessionResponse = await fetch("/api/videos/upload-session", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: validatedMetadata, file: { name: file.name, size: file.size, contentType } }), signal });
  if (!sessionResponse.ok) throw new Error((await sessionResponse.json().catch(() => undefined))?.error?.message || "Could not start the Google Drive upload.");
  const session = await sessionResponse.json() as UploadSession;
  const driveUpload = await createBrowserDriveUploadSession(file, contentType, session.googleDriveFolderId);
  let offset = 0;
  const retry = async <T>(work: () => Promise<T>): Promise<T> => { let last: unknown; for (let attempt = 0; attempt < 5; attempt += 1) { try { return await work(); } catch (error) { last = error; if (signal?.aborted) throw error; await new Promise(resolve => window.setTimeout(resolve, 500 * 2 ** attempt)); } } throw last; };
  while (offset < file.size) {
    if (signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");
    const end = Math.min(offset + session.chunkSize, file.size);
    const response = await retry(async () => { const result = await fetch(driveUpload.uploadUrl, { method: "PUT", headers: { Authorization: `Bearer ${driveUpload.accessToken}`, "Content-Type": contentType, "Content-Range": `bytes ${offset}-${end - 1}/${file.size}` }, body: file.slice(offset, end), signal }); if (result.status >= 500) throw new Error("Google Drive temporarily rejected the chunk."); return result; });
    if (response.status === 308) { const range = response.headers.get("Range"); offset = range ? Number(range.match(/-(\d+)$/)?.[1] ?? end - 1) + 1 : end; }
    else if (response.ok) { const completed = await response.json() as { id?: string }; if (!completed.id) throw new Error("Google Drive did not return an uploaded file ID."); await completePortfolioVideoUpload(session, completed.id, signal); offset = file.size; }
    else throw new Error(`Google Drive rejected the upload chunk (${response.status}).`);
    onProgress?.({ loaded: offset, total: file.size, percentage: offset / file.size * 100 });
  }
}

export async function uploadPortfolioThumbnail(file: File, signal?: AbortSignal): Promise<PutBlobResult> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP thumbnail.");
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Thumbnails must be 10 MiB or smaller.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return upload(`portfolio-thumbnails/${safeName}`, file, { access: "public", contentType: file.type, handleUploadUrl: "/api/videos/upload", multipart: true, abortSignal: signal });
}
