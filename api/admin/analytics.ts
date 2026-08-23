import { requireAdmin } from "../../src/server/auth";
import { withErrorHandling } from "../../src/server/errors";

export default { fetch: withErrorHandling((request) => {
  if (request.method !== "GET") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET" } });
  requireAdmin(request);
  return Response.json({ message: "Analytics integration has not been configured." }, { headers: { "Cache-Control": "no-store" } });
}) };
