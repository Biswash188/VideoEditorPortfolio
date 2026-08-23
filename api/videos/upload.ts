import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "../../src/server/auth";
import { requireBlobReadWriteToken } from "../../src/server/env";
import { ApiError, withErrorHandling } from "../../src/server/errors";
import { createVideo, getVideoByBlobUrl } from "../../src/server/database/videos";
import {
  createVideoBlobPath,
  getVideoContentType,
  isSupportedVideoContentType,
  parseVideoUploadPayload,
  VIDEO_BLOB_PATH_PREFIX,
} from "../../src/shared/video-upload";

function validateUploadPath(pathname: string, fileName: string): void {
  if (pathname !== createVideoBlobPath(fileName)) {
    throw new ApiError(400, "INVALID_UPLOAD_PATH", "Invalid video upload destination.");
  }
}

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

      let uploadPayload: ReturnType<typeof parseVideoUploadPayload>;

      try {
        uploadPayload = parseVideoUploadPayload(clientPayload);
      } catch {
        throw new ApiError(400, "INVALID_UPLOAD_METADATA", "Video metadata is invalid.");
      }
      validateUploadPath(pathname, uploadPayload.file.name);

      return {
        allowedContentTypes: [uploadPayload.file.contentType],
        maximumSizeInBytes: uploadPayload.file.size,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify(uploadPayload),
      };
    },
    onUploadCompleted: async ({ blob, tokenPayload }) => {
      const uploadPayload = parseVideoUploadPayload(tokenPayload ?? null);
      const expectedContentType = getVideoContentType(uploadPayload.file.name);

      if (
        !blob.pathname.startsWith(`${VIDEO_BLOB_PATH_PREFIX}/`) ||
        !expectedContentType ||
        !isSupportedVideoContentType(blob.contentType) ||
        blob.contentType.toLowerCase().split(";", 1)[0] !== expectedContentType
      ) {
        throw new Error("Completed blob did not match the authorized video upload.");
      }

      // Callbacks may be retried. Do not create a second project record for the same Blob URL.
      if (await getVideoByBlobUrl(blob.url)) {
        return;
      }

      await createVideo({
        ...uploadPayload.metadata,
        videoUrl: blob.url,
      });
    },
  });

  return Response.json(response);
}

export default { fetch: withErrorHandling(handleVideoUpload) };
