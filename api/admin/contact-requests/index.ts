import { requireAdmin } from "../../../src/server/auth.js";
import { listContactRequests } from "../../../src/server/database/contact-requests.js";
import { withErrorHandling } from "../../../src/server/errors.js";

export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  if (request.method !== "GET") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET" } });
  return Response.json(await listContactRequests(), { headers: { "Cache-Control": "no-store" } });
}) };
