import { z } from "zod";

import { createContactRequest } from "../../src/server/database/contact-requests.js";

import { withErrorHandling } from "../../src/server/errors.js";

import { parseJsonBody } from "../../src/server/validation.js";

const createContactRequestSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(255),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  projectType: z.string().trim().min(1, "Project type is required.").max(100),
  message: z.string().trim().min(1, "Message is required.").max(5_000),
}).strict();

export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const contactRequest = await createContactRequest(
    await parseJsonBody(request, createContactRequestSchema),
  );

  return Response.json(
    { message: "Thanks for reaching out. Your message has been sent.", id: contactRequest.id },
    { status: 201 },
  );
}) };
