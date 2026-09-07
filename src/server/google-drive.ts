import { ApiError } from "./errors.js";
import { requireGoogleDriveConfig } from "./env.js";

type DriveFile = { id: string; name: string; mimeType: string; size?: string; trashed?: boolean; parents?: string[] };

/**
 * Drive's resumable/session and mutation endpoints return tiny JSON or empty
 * bodies. Always drain them before a local Vercel worker returns. Leaving an
 * Undici response body open can keep its Windows async handle alive while the
 * dev worker is torn down, which triggers libuv's UV_HANDLE_CLOSING assertion.
 */
async function drainResponse(response: Response): Promise<void> {
  try {
    await response.text();
  } catch {
    // There is nothing useful to recover from a failed best-effort drain. The
    // caller still handles the HTTP status as the authoritative result.
  }
}

async function accessToken(): Promise<string> {
  const config = requireGoogleDriveConfig();
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, refresh_token: config.refreshToken, grant_type: "refresh_token" }),
  });
  const body = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !body.access_token) throw new ApiError(502, "GOOGLE_AUTH_FAILED", body.error_description || "Could not authorize Google Drive.");
  return body.access_token;
}

async function driveFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await accessToken();
  return fetch(`https://www.googleapis.com/drive/v3/${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers } });
}

export async function createResumableUploadSession(input: { filename: string; mimeType: string }): Promise<string> {
  const { folderId } = requireGoogleDriveConfig();
  const token = await accessToken();
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": input.mimeType },
    body: JSON.stringify({ name: input.filename, mimeType: input.mimeType, parents: [folderId] }),
  });
  const location = response.headers.get("location");
  await drainResponse(response);
  if (!response.ok || !location) throw new ApiError(502, "GOOGLE_UPLOAD_SESSION_FAILED", "Google Drive could not create an upload session.");
  return location;
}

export async function getDriveFile(id: string): Promise<DriveFile> {
  const response = await driveFetch(`files/${encodeURIComponent(id)}?fields=id,name,mimeType,size,trashed,parents`);
  if (!response.ok) { await drainResponse(response); throw new ApiError(400, "INVALID_DRIVE_FILE", "The uploaded Google Drive file could not be verified."); }
  return response.json() as Promise<DriveFile>;
}

export async function makeDriveFilePublic(id: string): Promise<void> {
  const response = await driveFetch(`files/${encodeURIComponent(id)}/permissions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "anyone", role: "reader", allowFileDiscovery: false }) });
  await drainResponse(response);
  if (!response.ok) throw new ApiError(502, "GOOGLE_PERMISSION_FAILED", "Google Drive could not grant the portfolio read permission.");
}

export async function renameDriveFile(id: string, name: string): Promise<void> {
  const response = await driveFetch(`files/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
  await drainResponse(response);
  if (!response.ok) throw new ApiError(502, "GOOGLE_UPDATE_FAILED", "Google Drive could not update the filename.");
}

export async function trashDriveFile(id: string): Promise<void> {
  const response = await driveFetch(`files/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ trashed: true }) });
  await drainResponse(response);
  if (!response.ok) throw new ApiError(502, "GOOGLE_DELETE_FAILED", "Google Drive could not move the video to trash; the database was not changed.");
}

export function drivePlaybackUrl(fileId: string): string { return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`; }
