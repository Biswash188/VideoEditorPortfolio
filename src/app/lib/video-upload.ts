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
  const session = await sessionResponse.json() as { uploadSessionId: string; completionToken: string; uploadUrl: string; chunkSize: number };
  let offset = 0;
  const retry = async <T>(work: () => Promise<T>): Promise<T> => { let last: unknown; for (let attempt = 0; attempt < 5; attempt += 1) { try { return await work(); } catch (error) { last = error; if (signal?.aborted) throw error; await new Promise(resolve => window.setTimeout(resolve, 500 * 2 ** attempt)); } } throw last; };
  while (offset < file.size) {
    if (signal?.aborted) throw new DOMException("Upload cancelled", "AbortError");
    const end = Math.min(offset + session.chunkSize, file.size);
    const response = await retry(async () => { const result = await fetch(session.uploadUrl, { method: "PUT", headers: { "Content-Type": contentType, "Content-Range": `bytes ${offset}-${end - 1}/${file.size}` }, body: file.slice(offset, end), signal }); if (result.status >= 500) throw new Error("Google Drive temporarily rejected the chunk."); return result; });
    if (response.status === 308) { const range = response.headers.get("Range"); offset = range ? Number(range.match(/-(\d+)$/)?.[1] ?? end - 1) + 1 : end; }
    else if (response.ok) { const completed = await response.json() as { id?: string }; if (!completed.id) throw new Error("Google Drive did not return an uploaded file ID."); offset = file.size; const finish = await fetch("/api/videos/complete", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uploadSessionId: session.uploadSessionId, completionToken: session.completionToken, googleDriveFileId: completed.id }) }); if (!finish.ok) throw new Error((await finish.json().catch(() => undefined))?.error?.message || "Google Drive upload succeeded, but portfolio finalization failed. Retry the completion request from this browser session."); }
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
