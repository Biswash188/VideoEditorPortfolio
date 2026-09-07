import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "../../auth.js";
import { requireBlobReadWriteToken } from "../../env.js";
import { ApiError, withErrorHandling } from "../../errors.js";

const THUMBNAIL_BLOB_PATH_PREFIX = "portfolio-thumbnails/";
const THUMBNAIL_UPLOAD_TOKEN_PAYLOAD = "thumbnail";
const THUMBNAIL_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_THUMBNAIL_SIZE = 10 * 1024 * 1024;

async function handleVideoUpload(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return Response.json(
      { error: { code: "METHOD_NOT_ALLOWED", message: "Method not allowed." } },
      { status: 405, headers: { Allow: "POST" } },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  const response = await handleUpload({
    body,
    request,
    token: requireBlobReadWriteToken(),
    onBeforeGenerateToken: async (pathname, clientPayload) => {
      // Only client-token requests reach this callback. Blob completion callbacks
      // are signature-verified by handleUpload before onUploadCompleted is invoked.
      await requireAdmin(request);

      if (pathname.startsWith(THUMBNAIL_BLOB_PATH_PREFIX)) {
        return {
          allowedContentTypes: THUMBNAIL_CONTENT_TYPES,
          maximumSizeInBytes: MAX_THUMBNAIL_SIZE,
          addRandomSuffix: true,
          tokenPayload: THUMBNAIL_UPLOAD_TOKEN_PAYLOAD,
        };
      }

      throw new ApiError(400, "VIDEO_UPLOADS_USE_GOOGLE_DRIVE", "Video files must be uploaded through the Google Drive resumable upload flow.");
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      if (tokenPayload !== THUMBNAIL_UPLOAD_TOKEN_PAYLOAD || !blob.pathname.startsWith(THUMBNAIL_BLOB_PATH_PREFIX)) throw new Error("Unexpected Blob upload callback.");
    },
  });

  return Response.json(response);
}

export default { fetch: withErrorHandling(handleVideoUpload) };
