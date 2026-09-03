import { listPublishedVideos } from "../../src/server/database/videos.js";

import { withErrorHandling } from "../../src/server/errors.js";

export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "GET") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET" } });
  return Response.json(await listPublishedVideos(), { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}) };
