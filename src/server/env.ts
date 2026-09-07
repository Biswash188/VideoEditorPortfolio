import { z } from "zod";

const optionalServerEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  GOOGLE_REFRESH_TOKEN: z.string().min(1).optional(),
  GOOGLE_DRIVE_FOLDER_ID: z.string().min(1).optional(),
  MAX_VIDEO_SIZE_BYTES: z.coerce.number().int().positive().optional(),
});

export type ServerEnv = z.infer<typeof optionalServerEnvSchema>;

export function getServerEnv(): ServerEnv {
  return optionalServerEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    AUTH_SECRET: process.env.AUTH_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    GOOGLE_DRIVE_FOLDER_ID: process.env.GOOGLE_DRIVE_FOLDER_ID,
    MAX_VIDEO_SIZE_BYTES: process.env.MAX_VIDEO_SIZE_BYTES,
  });
}

export function requireGoogleDriveConfig() {
  const env = getServerEnv();
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REFRESH_TOKEN || !env.GOOGLE_DRIVE_FOLDER_ID) {
    throw new Error("GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, and GOOGLE_DRIVE_FOLDER_ID must be configured.");
  }
  return { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET, refreshToken: env.GOOGLE_REFRESH_TOKEN, folderId: env.GOOGLE_DRIVE_FOLDER_ID };
}

export function getMaxVideoSizeBytes(): number { return getServerEnv().MAX_VIDEO_SIZE_BYTES ?? 5 * 1024 * 1024 * 1024; }

export function requireDatabaseUrl(): string {
  const { DATABASE_URL } = getServerEnv();

  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return DATABASE_URL;
}

export function requireAdminAuthConfig(): {
  email: string;
  passwordHash: string;
  authSecret: string;
} {
  const { ADMIN_EMAIL, ADMIN_PASSWORD_HASH, AUTH_SECRET } = getServerEnv();

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD_HASH || !AUTH_SECRET) {
    throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and AUTH_SECRET must be configured.");
  }

  return { email: ADMIN_EMAIL, passwordHash: ADMIN_PASSWORD_HASH, authSecret: AUTH_SECRET };
}

export function requireBlobReadWriteToken(): string {
  const { BLOB_READ_WRITE_TOKEN } = getServerEnv();

  if (!BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not configured.");
  }

  return BLOB_READ_WRITE_TOKEN;
}
