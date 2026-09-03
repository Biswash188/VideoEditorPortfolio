import { withErrorHandling } from "../src/server/errors.js";

export default {
  fetch: withErrorHandling((request) => {
    if (request.method !== "GET") {
      return Response.json(
        { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
        { status: 405, headers: { Allow: "GET" } },
      );
    }

    return Response.json({ status: "ok", service: "portfolio-api" });
  }),
};