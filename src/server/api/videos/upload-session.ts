import { randomBytes } from "node:crypto";
import { z } from "zod";
import { requireAdmin } from "../../auth.js";
import { createUploadSession } from "../../database/videos.js";
import { ApiError, withErrorHandling } from "../../errors.js";
import { getMaxVideoSizeBytes, requireGoogleDriveConfig } from "../../env.js";
import { parseJsonBody } from "../../validation.js";
import { getVideoContentType, isSupportedVideoContentType, videoProjectMetadataSchema } from "../../../shared/video-upload.js";

const schema = z.object({ metadata: videoProjectMetadataSchema, file: z.object({ name: z.string().trim().min(1).max(255), size: z.number().int().positive(), contentType: z.string().min(1).max(100) }).strict() }).strict();
export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "POST") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "POST" } });
  const admin = requireAdmin(request); const input = await parseJsonBody(request, schema);
  const contentType = input.file.contentType.toLowerCase().split(";", 1)[0];
  if (!isSupportedVideoContentType(contentType) || getVideoContentType(input.file.name) !== contentType) throw new ApiError(400, "UNSUPPORTED_VIDEO_TYPE", "The filename and MIME type must be a supported MP4, MOV, WebM, or M4V video.");
  if (input.file.size > getMaxVideoSizeBytes()) throw new ApiError(400, "VIDEO_TOO_LARGE", `Videos must be ${getMaxVideoSizeBytes()} bytes or smaller.`);
  // The browser creates the Drive resumable session with its own short-lived
  // OAuth token. A session created with server credentials is not CORS-enabled
  // for the browser's subsequent PUT requests.
  const { folderId } = requireGoogleDriveConfig();
  const completionToken = randomBytes(32).toString("base64url");
  const session = await createUploadSession({ adminEmail: admin.email, completionToken, filename: input.file.name, mimeType: contentType, fileSize: input.file.size, metadata: JSON.stringify(input.metadata), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
  return Response.json({ uploadSessionId: session.id, completionToken, googleDriveFolderId: folderId, chunkSize: 8 * 1024 * 1024 });
}) };
