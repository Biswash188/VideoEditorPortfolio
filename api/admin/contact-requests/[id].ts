import { z } from "zod";
import { requireAdmin } from "../../../src/server/auth";
import { updateContactRequest } from "../../../src/server/database/contact-requests";
import { ApiError, withErrorHandling } from "../../../src/server/errors";
import { parseJsonBody } from "../../../src/server/validation";

const updateSchema = z.object({ status: z.enum(["new", "in_progress", "closed"]) }).strict();
export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  if (request.method !== "PATCH") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "PATCH" } });
  const id = new URL(request.url).pathname.split("/").pop();
  if (!id) throw new ApiError(400, "INVALID_CONTACT_REQUEST_ID", "Contact request id is required.");
  const contactRequest = await updateContactRequest(id, await parseJsonBody(request, updateSchema));
  if (!contactRequest) throw new ApiError(404, "NOT_FOUND", "Contact request not found.");
  return Response.json(contactRequest);
}) };
