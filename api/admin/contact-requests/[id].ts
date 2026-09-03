import { z } from "zod";
import { requireAdmin } from "../../../src/server/auth";
import { deleteContactRequest, updateContactRequest } from "../../../src/server/database/contact-requests";
import { ApiError, withErrorHandling } from "../../../src/server/errors";
import { parseJsonBody } from "../../../src/server/validation";

const updateSchema = z.object({ status: z.enum(["new", "read", "in_progress", "closed"]) }).strict();
export default { fetch: withErrorHandling(async (request) => {
  requireAdmin(request);
  const id = new URL(request.url).pathname.split("/").pop();
  if (!id || !z.string().uuid().safeParse(id).success) throw new ApiError(400, "INVALID_CONTACT_REQUEST_ID", "A valid contact request id is required.");
  if (request.method === "PATCH") {
    const contactRequest = await updateContactRequest(id, await parseJsonBody(request, updateSchema));
    if (!contactRequest) throw new ApiError(404, "NOT_FOUND", "Contact request not found.");
    return Response.json(contactRequest);
  }
  if (request.method === "DELETE") {
    const contactRequest = await deleteContactRequest(id);
    if (!contactRequest) throw new ApiError(404, "NOT_FOUND", "Contact request not found.");
    return Response.json({ deleted: true });
  }
  return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "PATCH, DELETE" } });
}) };
