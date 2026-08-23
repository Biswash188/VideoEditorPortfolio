import { z } from "zod";
import { requireAdmin } from "../../../src/server/auth";
import { createVideo, listVideos } from "../../../src/server/database/videos";
import { withErrorHandling } from "../../../src/server/errors";
import { parseJsonBody } from "../../../src/server/validation";
import { videoProjectMetadataSchema } from "../../../src/shared/video-upload";

const createSchema = videoProjectMetadataSchema.extend({ videoUrl: z.string().url().max(2_048) }).strict();
export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  if (request.method === "GET") return Response.json(await listVideos(), { headers: { "Cache-Control": "no-store" } });
  if (request.method === "POST") return Response.json(await createVideo(await parseJsonBody(request, createSchema)), { status: 201 });
  return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET, POST" } });
}) };
