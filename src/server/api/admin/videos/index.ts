import { z } from "zod";
import { requireAdmin } from "../../../auth.js";
import { createVideo, listVideos } from "../../../database/videos.js";
import { withErrorHandling } from "../../../errors.js";
import { parseJsonBody } from "../../../validation.js";
import { videoProjectMetadataSchema } from "../../../../shared/video-upload.js";

const createSchema = videoProjectMetadataSchema.extend({ videoUrl: z.string().url().max(2_048) }).strict();
export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  if (request.method === "GET") return Response.json(await listVideos(), { headers: { "Cache-Control": "no-store" } });
  if (request.method === "POST") return Response.json(await createVideo(await parseJsonBody(request, createSchema)), { status: 201 });
  return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET, POST" } });
}) };
