import { createHmac, timingSafeEqual } from "node:crypto";
import { isSessionToken } from "./session-tokens.js";

const CSRF_PATTERN = /^[A-Za-z0-9_-]{43}$/;

function csrfSecret(secret) {
  if (typeof secret !== "string" || Buffer.byteLength(secret, "utf8") < 32) {
    throw new TypeError("A private high-entropy CSRF secret of at least 32 bytes is required");
  }
  return secret;
}

export function csrfTokenForSession(sessionToken, secret) {
  if (!isSessionToken(sessionToken)) throw new TypeError("Invalid session binding");
  return createHmac("sha256", csrfSecret(secret))
    .update("devfolio-csrf-v1\0")
    .update(sessionToken, "ascii")
    .digest("base64url");
}

export function verifyCsrfToken(sessionToken, submittedToken, secret) {
  if (!isSessionToken(sessionToken) || typeof submittedToken !== "string" ||
      !CSRF_PATTERN.test(submittedToken)) return false;
  const expected = Buffer.from(csrfTokenForSession(sessionToken, secret), "ascii");
  return timingSafeEqual(expected, Buffer.from(submittedToken, "ascii"));
}

export function assertSameOrigin(origin, expectedOrigin) {
  if (typeof origin !== "string" || !origin ||
      typeof expectedOrigin !== "string" || !expectedOrigin) {
    throw new Error("Origin validation required");
  }
  let submitted;
  let expected;
  try {
    submitted = new URL(origin);
    expected = new URL(expectedOrigin);
  } catch {
    throw new Error("Invalid request origin");
  }
  for (const url of [submitted, expected]) {
    if (!["https:", "http:"].includes(url.protocol) ||
        url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw new Error("Invalid origin");
    }
  }
  if (submitted.origin !== expected.origin) throw new Error("Cross-origin mutation rejected");
  if (expected.protocol !== "https:" && !["localhost", "127.0.0.1", "[::1]"].includes(expected.hostname)) {
    throw new Error("Insecure remote origin rejected");
  }
  return true;
}

/**
 * Route integration MUST resolve owner session from PostgreSQL first, then
 * validate Origin + per-session CSRF for each cookie-authenticated mutation.
 */
export function verifyOwnerMutation({ method, origin, expectedOrigin, sessionToken, csrfToken, secret }) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) return false;
  try {
    assertSameOrigin(origin, expectedOrigin);
    return verifyCsrfToken(sessionToken, csrfToken, secret);
  } catch {
    return false;
  }
}
