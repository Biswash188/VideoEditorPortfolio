import { clearAdminSessionCookie } from "../../src/server/auth.js";
import { withErrorHandling } from "../../src/server/errors.js";

export default { fetch: withErrorHandling((request) => {
  if (request.method !== "POST") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "POST" } });
  return Response.json({ authenticated: false }, { headers: { "Set-Cookie": clearAdminSessionCookie(), "Cache-Control": "no-store" } });
}) };
