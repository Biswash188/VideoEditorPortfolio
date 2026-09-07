import { z } from "zod";
import { requireAdmin } from "../../../auth.js";
import { deleteVideo, getVideoById, updateVideo } from "../../../database/videos.js";
import { renameDriveFile, trashDriveFile } from "../../../google-drive.js";
import { ApiError, withErrorHandling } from "../../../errors.js";
import { parseJsonBody } from "../../../validation.js";
import { videoProjectMetadataSchema } from "../../../../shared/video-upload.js";

const updateSchema = videoProjectMetadataSchema.partial().extend({ videoUrl: z.string().url().max(2_048).optional() }).strict();
export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  const id = new URL(request.url).pathname.split("/").pop();
  if (!id) throw new ApiError(400, "INVALID_VIDEO_ID", "Video id is required.");
  if (request.method === "PATCH") { const input = await parseJsonBody(request, updateSchema); const current = await getVideoById(id); if (!current) throw new ApiError(404, "NOT_FOUND", "Video not found."); if (current.googleDriveFileId && input.title && input.title !== current.title) { const extension = current.originalFilename?.match(/(\.[^.]+)$/)?.[1] ?? ""; await renameDriveFile(current.googleDriveFileId, `${input.title}${extension}`); } const video = await updateVideo(id, input); return Response.json(video); }
  if (request.method === "DELETE") { const current = await getVideoById(id); if (!current) throw new ApiError(404, "NOT_FOUND", "Video not found."); if (current.googleDriveFileId) await trashDriveFile(current.googleDriveFileId); const video = await deleteVideo(id); return Response.json({ deleted: Boolean(video) }); }
  return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "PATCH, DELETE" } });
}) };
