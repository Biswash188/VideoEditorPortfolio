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
 * Performs a browser-to-Blob multipart upload. The Vercel Blob read/write token
 * remains on the server; this only requests a short-lived, constrained client token.
 */
export async function uploadPortfolioVideo({
  file,
  metadata,
  signal,
  onProgress,
}: UploadPortfolioVideoOptions): Promise<PutBlobResult> {
  const validatedMetadata = videoProjectMetadataSchema.parse(metadata);
  const { contentType } = validateVideoFile(file);

  return upload(createVideoBlobPath(file.name), file, {
    access: "public",
    contentType,
    handleUploadUrl: "/api/videos/upload",
    clientPayload: JSON.stringify({
      metadata: validatedMetadata,
      file: { name: file.name, size: file.size, contentType },
    }),
    multipart: true,
    abortSignal: signal,
    onUploadProgress: onProgress,
  });
}

export async function uploadPortfolioThumbnail(file: File, signal?: AbortSignal): Promise<PutBlobResult> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) throw new Error("Choose a JPG, PNG, or WebP thumbnail.");
  if (!file.size || file.size > 10 * 1024 * 1024) throw new Error("Thumbnails must be 10 MiB or smaller.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
  return upload(`portfolio-thumbnails/${safeName}`, file, { access: "public", contentType: file.type, handleUploadUrl: "/api/videos/upload", multipart: true, abortSignal: signal });
}
