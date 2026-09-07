import { z } from "zod";
import { requireAdmin } from "../../src/server/auth.js";
import { completeUploadSession, createVideo, getUploadSession, getVideoByGoogleDriveFileId, updateVideo } from "../../src/server/database/videos.js";
import { ApiError, withErrorHandling } from "../../src/server/errors.js";
import { drivePlaybackUrl, getDriveFile, makeDriveFilePublic } from "../../src/server/google-drive.js";
import { parseJsonBody } from "../../src/server/validation.js";
import { videoProjectMetadataSchema } from "../../src/shared/video-upload.js";

const schema = z.object({ uploadSessionId: z.string().uuid(), completionToken: z.string().min(20), googleDriveFileId: z.string().min(1).max(255) }).strict();
export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "POST") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "POST" } });
  const admin = requireAdmin(request); const input = await parseJsonBody(request, schema); const session = await getUploadSession(input.uploadSessionId);
  if (!session || session.adminEmail !== admin.email || session.completionToken !== input.completionToken || session.expiresAt < new Date()) throw new ApiError(403, "INVALID_UPLOAD_SESSION", "This upload session is invalid or expired.");
  if (session.completedAt && session.googleDriveFileId === input.googleDriveFileId) return Response.json({ completed: true });
  const metadata = videoProjectMetadataSchema.parse(JSON.parse(session.metadata));
  const existing = await getVideoByGoogleDriveFileId(input.googleDriveFileId);
  if (existing) { await makeDriveFilePublic(input.googleDriveFileId); await updateVideo(existing.id, { isPublished: metadata.isPublished }); await completeUploadSession(session.id, input.googleDriveFileId); return Response.json({ completed: true }); }
  const file = await getDriveFile(input.googleDriveFileId);
  if (file.trashed || file.mimeType !== session.mimeType || Number(file.size) !== session.fileSize) throw new ApiError(400, "UPLOAD_MISMATCH", "The Google Drive file does not match this upload session.");
  const video = await createVideo({ ...metadata, isPublished: false, videoUrl: drivePlaybackUrl(file.id), googleDriveFileId: file.id, googleDriveFolderId: process.env.GOOGLE_DRIVE_FOLDER_ID, originalFilename: session.filename, mimeType: session.mimeType, fileSize: session.fileSize });
  await makeDriveFilePublic(file.id);
  await updateVideo(video.id, { isPublished: metadata.isPublished });
  await completeUploadSession(session.id, file.id);
  return Response.json({ completed: true }, { status: 201 });
}) };
