import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { requireAdminAuthConfig } from "./env.js";
import { ApiError } from "./errors.js";

const SESSION_COOKIE_NAME = "portfolio_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const PASSWORD_HASH_PREFIX = "scrypt";
type AdminSession = { email: string; expiresAt: number };

function encodeBase64Url(value: string | Uint8Array): string { return Buffer.from(value).toString("base64url"); }
function decodeBase64Url(value: string): string | undefined { try { return Buffer.from(value, "base64url").toString("utf8"); } catch { return undefined; } }
function signSession(payload: string, secret: string): string { return createHmac("sha256", secret).update(payload).digest("base64url"); }

function readCookie(request: Request, name: string): string | undefined {
  return request.headers.get("cookie")?.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
}

function sessionCookie(value: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
}

function derivePasswordHash(password: string, salt: Buffer, length: number, cost: number, blockSize: number, parallelization: number): Promise<Buffer> {
  return new Promise((resolve, reject) => scrypt(password, salt, length, { N: cost, r: blockSize, p: parallelization, maxmem: 128 * 1024 * 1024 }, (error, key) => error ? reject(error) : resolve(key)));
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const { passwordHash } = requireAdminAuthConfig();
  const [algorithm, costValue, blockSizeValue, parallelizationValue, salt, hash] = passwordHash.split("$");
  const cost = Number(costValue), blockSize = Number(blockSizeValue), parallelization = Number(parallelizationValue);
  if (algorithm !== PASSWORD_HASH_PREFIX || !Number.isInteger(cost) || !Number.isInteger(blockSize) || !Number.isInteger(parallelization) || !salt || !hash) throw new Error("ADMIN_PASSWORD_HASH has an invalid format.");
  const expected = Buffer.from(hash, "base64url");
  const derived = await derivePasswordHash(password, Buffer.from(salt, "base64url"), expected.length, cost, blockSize, parallelization);
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function createAdminSessionCookie(): string {
  const { email, authSecret } = requireAdminAuthConfig();
  const payload = encodeBase64Url(JSON.stringify({ email, expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS } satisfies AdminSession));
  return sessionCookie(`${payload}.${signSession(payload, authSecret)}`, SESSION_MAX_AGE_SECONDS);
}

export function clearAdminSessionCookie(): string { return sessionCookie("", 0); }

export function getAdminSession(request: Request): AdminSession | undefined {
  const value = readCookie(request, SESSION_COOKIE_NAME);
  if (!value) return undefined;
  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature) return undefined;
  const { authSecret, email } = requireAdminAuthConfig();
  const supplied = Buffer.from(signature), expected = Buffer.from(signSession(encodedPayload, authSecret));
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return undefined;
  const decoded = decodeBase64Url(encodedPayload);
  if (!decoded) return undefined;
  try {
    const session = JSON.parse(decoded) as AdminSession;
    return session.email === email && Number.isInteger(session.expiresAt) && session.expiresAt > Date.now() / 1000 ? session : undefined;
  } catch { return undefined; }
}

export function requireAdmin(request: Request): AdminSession {
  const session = getAdminSession(request);
  if (!session) throw new ApiError(401, "UNAUTHORIZED", "Administrator authentication is required.");
  return session;
}

export async function hashAdminPasswordForSetup(password: string): Promise<string> {
  if (password.length < 12) throw new Error("Use an administrator password of at least 12 characters.");
  const salt = randomBytes(16), cost = 16_384, blockSize = 8, parallelization = 1;
  const hash = await derivePasswordHash(password, salt, 64, cost, blockSize, parallelization);
  return `${PASSWORD_HASH_PREFIX}$${cost}$${blockSize}$${parallelization}$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}
