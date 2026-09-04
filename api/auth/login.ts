import { z } from "zod";
import { createAdminSessionCookie, verifyAdminPassword } from "../../src/server/auth.js";
import { getServerEnv } from "../../src/server/env.js";
import { ApiError, withErrorHandling } from "../../src/server/errors.js";
import { parseJsonBody } from "../../src/server/validation.js";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1).max(1_024) }).strict();

export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "POST") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "POST" } });
  const { email, password } = await parseJsonBody(request, loginSchema);
  const { ADMIN_EMAIL } = getServerEnv();
  const passwordMatches = await verifyAdminPassword(password);
  if (!ADMIN_EMAIL || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase() || !passwordMatches) throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
  return Response.json({ authenticated: true }, { headers: { "Set-Cookie": createAdminSessionCookie(), "Cache-Control": "no-store" } });
}) };
