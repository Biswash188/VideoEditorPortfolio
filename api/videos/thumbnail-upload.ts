import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "../../src/server/auth.js";
import { requireBlobReadWriteToken } from "../../src/server/env.js";
import { ApiError, withErrorHandling } from "../../src/server/errors.js";

const allowedContentTypes = ["image/jpeg", "image/png", "image/webp"];
const maxThumbnailSize = 10 * 1024 * 1024;

export default { fetch: withErrorHandling(async (request) => {
  if (request.method !== "POST") return Response.json({ error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } }, { status: 405, headers: { Allow: "POST" } });
  const body = await request.json() as HandleUploadBody;
  const response = await handleUpload({
    body, request, token: requireBlobReadWriteToken(),
    onBeforeGenerateToken: async (pathname) => {
      requireAdmin(request);
      if (!pathname.startsWith("portfolio-thumbnails/")) throw new ApiError(400, "INVALID_UPLOAD_PATH", "Invalid thumbnail destination.");
      return { allowedContentTypes, maximumSizeInBytes: maxThumbnailSize, addRandomSuffix: true };
    },
  });
  return Response.json(response);
}) };
