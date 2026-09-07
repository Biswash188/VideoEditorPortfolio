import { requireAdmin } from "../../auth.js";
import { withErrorHandling } from "../../errors.js";

export default { fetch: withErrorHandling((request) => {
  if (request.method !== "GET") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET" } });
  requireAdmin(request);
  return Response.json({ message: "Analytics integration has not been configured." }, { headers: { "Cache-Control": "no-store" } });
}) };
