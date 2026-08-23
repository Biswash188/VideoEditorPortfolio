import { z } from "zod";
import { requireAdmin } from "../../../src/server/auth";
import { deleteVideo, updateVideo } from "../../../src/server/database/videos";
import { ApiError, withErrorHandling } from "../../../src/server/errors";
import { parseJsonBody } from "../../../src/server/validation";
import { videoProjectMetadataSchema } from "../../../src/shared/video-upload";

const updateSchema = videoProjectMetadataSchema.partial().extend({ videoUrl: z.string().url().max(2_048).optional() }).strict();
export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  const id = new URL(request.url).pathname.split("/").pop();
  if (!id) throw new ApiError(400, "INVALID_VIDEO_ID", "Video id is required.");
  if (request.method === "PATCH") { const video = await updateVideo(id, await parseJsonBody(request, updateSchema)); if (!video) throw new ApiError(404, "NOT_FOUND", "Video not found."); return Response.json(video); }
  if (request.method === "DELETE") { const video = await deleteVideo(id); if (!video) throw new ApiError(404, "NOT_FOUND", "Video not found."); return Response.json({ deleted: true }); }
  return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "PATCH, DELETE" } });
}) };
