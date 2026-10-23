import { createHash, randomBytes } from "node:crypto";

// 256-bit opaque session secrets, never store in SQL or logs in plaintext.
const SESSION_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isSessionToken(value) {
  return typeof value === "string" && SESSION_PATTERN.test(value);
}

export function generateSessionToken(bytes = randomBytes) {
  const raw = bytes(32);
  if (!(raw instanceof Uint8Array) || raw.byteLength !== 32) {
    throw new TypeError("Session entropy source must return exactly 32 bytes");
  }
  return Buffer.from(raw).toString("base64url");
}

export function digestSessionToken(token) {
  if (!isSessionToken(token)) return null;
  return createHash("sha256").update(token, "ascii").digest("hex");
}

export function sessionCookieName(isProduction) {
  return isProduction ? "__Host-devfolio_session" : "devfolio_session";
}

export function serializeSessionCookie(token, { isProduction = false, maxAgeSeconds = 3600 } = {}) {
  if (!isSessionToken(token) || !Number.isInteger(maxAgeSeconds) ||
      maxAgeSeconds < 1 || maxAgeSeconds > 86_400) {
    throw new TypeError("Invalid session cookie parameters");
  }
  const name = sessionCookieName(isProduction);
  const secure = isProduction ? "; Secure" : "";
  return `${name}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearSessionCookie({ isProduction = false } = {}) {
  const secure = isProduction ? "; Secure" : "";
  return `${sessionCookieName(isProduction)}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export function readSessionCookie(header, { isProduction = false } = {}) {
  if (typeof header !== "string" || header.length > 8192) return null;
  const name = sessionCookieName(isProduction);
  const matching = header.split(";").map((x) => x.trim()).filter((part) => part.startsWith(`${name}=`));
  if (matching.length !== 1) return null; // Duplicate-name ambiguity fails closed.
  const token = matching[0].slice(name.length + 1);
  return isSessionToken(token) ? token : null;
}
