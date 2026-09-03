import { requireAdmin } from "../../src/server/auth.js";
import { withErrorHandling } from "../../src/server/errors.js";

export default { fetch: withErrorHandling((request) => {
  if (request.method !== "GET") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "GET" } });
  const session = requireAdmin(request);
  return Response.json({ authenticated: true, email: session.email }, { headers: { "Cache-Control": "no-store" } });
}) };
