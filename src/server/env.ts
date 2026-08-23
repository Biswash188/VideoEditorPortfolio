import { z } from "zod";

const optionalServerEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD_HASH: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(32).optional(),
  BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof optionalServerEnvSchema>;

export function getServerEnv(): ServerEnv {
  return optionalServerEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    AUTH_SECRET: process.env.AUTH_SECRET,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
  });
}

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
