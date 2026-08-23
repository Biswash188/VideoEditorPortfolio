import { z } from "zod";

export const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2 GiB
export const VIDEO_BLOB_PATH_PREFIX = "portfolio-videos";

export const videoFormats = {
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
} as const;

export const supportedVideoContentTypes = Object.values(videoFormats);
export const videoFileAccept = ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime";

export const videoProjectMetadataSchema = z
  .object({
    title: z.string().trim().min(1).max(255),
    category: z.string().trim().min(1).max(100),
    description: z.string().trim().max(5_000).default(""),
    thumbnailUrl: z.string().url().max(2_048).optional(),
    durationSeconds: z.number().int().positive().max(86_400).optional(),
    isPublished: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    displayOrder: z.number().int().min(0).max(100_000).default(0),
  })
  .strict();

export type VideoProjectMetadata = z.output<typeof videoProjectMetadataSchema>;

const videoUploadPayloadSchema = z
  .object({
    metadata: videoProjectMetadataSchema,
    file: z
      .object({
        name: z.string().trim().min(1).max(255),
        size: z.number().int().positive().max(MAX_VIDEO_SIZE_BYTES),
        contentType: z.enum(["video/mp4", "video/webm", "video/quicktime"]),
      })
      .strict(),
  })
  .strict();

export type VideoUploadPayload = z.output<typeof videoUploadPayloadSchema>;

export function getVideoExtension(fileName: string): keyof typeof videoFormats | undefined {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension in videoFormats
    ? (extension as keyof typeof videoFormats)
    : undefined;
}

export function getVideoContentType(fileName: string): (typeof videoFormats)[keyof typeof videoFormats] | undefined {
  const extension = getVideoExtension(fileName);
  return extension ? videoFormats[extension] : undefined;
}

export function isSupportedVideoContentType(contentType: string): boolean {
  return supportedVideoContentTypes.includes(
    contentType.toLowerCase().split(";", 1)[0] as (typeof supportedVideoContentTypes)[number],
  );
}

export function sanitizeVideoFileName(fileName: string): string {
  const extension = getVideoExtension(fileName);

  if (!extension) {
    throw new Error("Only MP4, WebM, and MOV video files are supported.");
  }

  const baseName = fileName.slice(0, -(extension.length + 1))
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "video";

  return `${baseName}.${extension}`;
}

export function createVideoBlobPath(fileName: string): string {
  return `${VIDEO_BLOB_PATH_PREFIX}/${sanitizeVideoFileName(fileName)}`;
}

export function parseVideoUploadPayload(payload: string | null): VideoUploadPayload {
  if (!payload) {
    throw new Error("Video metadata is required.");
  }

  try {
    return videoUploadPayloadSchema.parse(JSON.parse(payload));
  } catch {
    throw new Error("Video upload metadata is invalid.");
  }
}

export function validateVideoFile(file: Pick<File, "name" | "size" | "type">): {
  contentType: (typeof videoFormats)[keyof typeof videoFormats];
} {
  const contentType = getVideoContentType(file.name);

  if (!contentType) {
    throw new Error("Choose an MP4, WebM, or MOV video file.");
  }

  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new Error("The selected video is empty or unreadable.");
  }

  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    throw new Error("Videos must be 2 GiB or smaller.");
  }

  if (file.type && !isSupportedVideoContentType(file.type)) {
    throw new Error("The selected file has an unsupported video content type.");
  }

  return { contentType };
}
