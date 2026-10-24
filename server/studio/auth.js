import { createHash, createHmac, randomBytes, randomInt, scrypt as rawScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { initializeStudio, studioPool } from "./db.js";
import { StudioError } from "./errors.js";

// Authentication uses salted scrypt passwords, single-use HMAC OTPs, and opaque hashed sessions.
const scrypt = promisify(rawScrypt);
const COOKIE = "portfolio_owner";
export const hash = (value) => createHash("sha256").update(value).digest("hex");
const authKey = () => {
  const value = process.env.PORTFOLIO_AUTH_SECRET;
  if (!value || value.startsWith("REPLACE_WITH") || Buffer.byteLength(value) < 32) throw new StudioError(503, "Set PORTFOLIO_AUTH_SECRET (32+ random characters) in .env");
  return value;
};
const digest = (value) => createHmac("sha256", authKey()).update(value).digest("hex");
export const failures = (code = 401, message = "Invalid credentials or verification code") => new StudioError(code, message);


export async function makePasswordHash(password) {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) {
    throw new StudioError(422, "Password must be 12–128 characters long");
  }
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return salt.toString("hex") + ":" + key.toString("hex");
}
export async function matchesPassword(password, stored) {
  if (typeof password !== "string" || password.length > 128) return false;
  const pieces = typeof stored === "string" ? stored.split(":") : [];
  if (pieces.length !== 2 || !/^[a-f0-9]{32}$/.test(pieces[0]) || !/^[a-f0-9]{128}$/.test(pieces[1])) return false;
  const actual = await scrypt(password, Buffer.from(pieces[0], "hex"), 64);
  return timingSafeEqual(actual, Buffer.from(pieces[1], "hex"));
}
export async function createInitialOwner(email, password) {
  await initializeStudio();
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || normalized.length > 254) throw new StudioError(422, "Enter a valid email");
  const stored = await makePasswordHash(password);
  const client = await studioPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("LOCK TABLE portfolio_studio_owner IN EXCLUSIVE MODE");
    const exists = await client.query("SELECT id FROM portfolio_studio_owner LIMIT 1");
    if (exists.rowCount) throw new StudioError(409, "Owner already configured; no second owner can be added");
    await client.query("INSERT INTO portfolio_studio_owner(email,password_hash) VALUES($1,$2)", [normalized, stored]);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}
/**
 * Change the single owner password only after verifying their current password.
 * The change and session revocation are one atomic database transaction.
 */
export async function changeStudioPassword(email, currentPassword, newPassword) {
  await initializeStudio();
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  // Validate the new password before beginning the transaction.
  if (currentPassword === newPassword) throw new StudioError(422, "Choose a different new password.");
  const nextHash = await makePasswordHash(newPassword);
  const client = await studioPool().connect();
  try {
    await client.query("BEGIN");
    // Lock the owner to serialize concurrent password changes.
    const owners = await client.query("SELECT id,email,password_hash FROM portfolio_studio_owner FOR UPDATE");
    const record = owners.rows.find((owner) => owner.email === normalized);
    const valid = await matchesPassword(currentPassword, record?.password_hash || "00000000000000000000000000000000:" + "0".repeat(128));
    if (!record || !valid) throw failures();
    await client.query("UPDATE portfolio_studio_owner SET password_hash=$1 WHERE id=$2", [nextHash, record.id]);
    await client.query("DELETE FROM portfolio_studio_sessions WHERE owner_id=$1", [record.id]);
    await client.query("DELETE FROM portfolio_studio_challenges WHERE owner_id=$1", [record.id]);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
export function allowedOrigin(request) {
  const submitted = request.headers.origin;
  const configured = process.env.PORTFOLIO_PUBLIC_ORIGIN || process.env.CMS_PUBLIC_ORIGIN || "http://127.0.0.1:3000";
  const allowed = [new URL(configured).origin];
  if (process.env.NODE_ENV !== "production") allowed.push("http://127.0.0.1:3000", "http://localhost:3000");
  return typeof submitted === "string" && allowed.includes(submitted) && request.get("sec-fetch-site") !== "cross-site";
}
// Express requests expose an object; React Router SSR loaders receive a WHATWG Request.
// Reading only .headers.cookie silently rejected valid cookies on /admin after OTP login.
export function cookieToken(request) {
  const headers = request?.headers;
  const value = typeof headers?.get === "function" ? headers.get("cookie") : headers?.cookie;
  if (typeof value !== "string" || value.length > 4096) return "";
  const pairs = value.split(";").map((part) => part.trim()).filter((part) => part.startsWith(COOKIE + "="));
  if (pairs.length !== 1) return "";
  const token = pairs[0].slice(COOKIE.length + 1);
  return /^[A-Za-z0-9_-]{43}$/.test(token) ? token : "";
}
async function ownerFromRequest(request) {
  const token = cookieToken(request);
  if (!token) return null;
  const db = studioPool();
  if (!db) return null;
  const result = await db.query(
    "UPDATE portfolio_studio_sessions SET last_seen_at=now() WHERE token_digest=$1 AND expires_at>now() AND last_seen_at>now()-interval '45 minutes' RETURNING owner_id",
    [hash(token)],
  );
  if (!result.rowCount) return null;
  return { ownerId: result.rows[0].owner_id, token };
}
export async function studioSession(request) {
  await initializeStudio();
  return ownerFromRequest(request);
}
export async function throttle(key, max, windowSeconds) {
  const result = await studioPool().query(
    "INSERT INTO portfolio_studio_attempts(key_digest,attempts,reset_at) VALUES($1,1,now()+($2::int*interval '1 second')) ON CONFLICT(key_digest) DO UPDATE SET attempts=CASE WHEN portfolio_studio_attempts.reset_at<now() THEN 1 ELSE portfolio_studio_attempts.attempts+1 END, reset_at=CASE WHEN portfolio_studio_attempts.reset_at<now() THEN now()+($2::int*interval '1 second') ELSE portfolio_studio_attempts.reset_at END RETURNING attempts",
    [digest(key), windowSeconds],
  );
  if (result.rows[0].attempts > max) throw failures(429, "Too many attempts. Try again later.");
}
async function deliverCode(email, code) {
  const key = process.env.RESEND_API_KEY;
  const sender = process.env.PORTFOLIO_FROM_EMAIL;
  if (key && sender) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: sender, to: [email], subject: "Your portfolio sign-in code",
        text: "Your one-time portfolio sign-in code is " + code + ". It expires in 10 minutes. If you did not request it, ignore this email.",
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new StudioError(503, "Email delivery unavailable. Check your Resend sender and API key.");
    return;
  }
  if (process.env.NODE_ENV !== "production" && process.env.PORTFOLIO_DEV_PRINT_OTP === "true") {
    console.info("DEV ONLY portfolio sign-in code for " + email + ": " + code);
    return;
  }
  throw new StudioError(503, "Configure RESEND_API_KEY and PORTFOLIO_FROM_EMAIL for email verification.");
}
export async function beginLogin(request, response) {
  const email = typeof request.body?.email === "string" ? request.body.email.trim().toLowerCase() : "";
  const password = request.body?.password;
  const key = String(request.ip || "unknown");
  await throttle("password-ip:" + key, 15, 900);
  await throttle("password-email:" + email, 6, 900);
  const owner = await studioPool().query("SELECT id,email,password_hash FROM portfolio_studio_owner WHERE email=$1 LIMIT 1", [email]);
  const record = owner.rows[0];
  // Perform the same expensive password operation for unknown accounts.
  const valid = await matchesPassword(password, record?.password_hash || "00000000000000000000000000000000:" + "0".repeat(128));
  if (!record || !valid) throw failures();
  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const challenge = await studioPool().query(
    "INSERT INTO portfolio_studio_challenges(owner_id,code_digest,expires_at) VALUES($1,$2,now()+interval '10 minutes') RETURNING id",
    [record.id, digest(code)],
  );
  try { await deliverCode(record.email, code); }
  catch (error) {
    await studioPool().query("DELETE FROM portfolio_studio_challenges WHERE id=$1", [challenge.rows[0].id]);
    throw error;
  }
  response.json({ challengeId: challenge.rows[0].id, message: "Enter the six-digit code sent to your email." });
}
export async function verifyLogin(request, response) {
  const id = request.body?.challengeId;
  const code = request.body?.code;
  if (typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) ||
      typeof code !== "string" || !/^\d{6}$/.test(code)) throw failures();
  await throttle("otp-ip:" + String(request.ip || "unknown"), 30, 900);
  const db = studioPool();
  const client = await db.connect();
  let token = null;
  try {
    await client.query("BEGIN");
    const found = await client.query(
      "SELECT owner_id,code_digest,attempts,expires_at,consumed_at FROM portfolio_studio_challenges WHERE id=$1::uuid FOR UPDATE", [id],
    );
    const row = found.rows[0];
    if (!row || row.consumed_at || row.attempts >= 5 || new Date(row.expires_at).getTime() <= Date.now()) {
      await client.query("COMMIT"); throw failures();
    }
    await client.query("UPDATE portfolio_studio_challenges SET attempts=attempts+1 WHERE id=$1::uuid", [id]);
    const actual = Buffer.from(digest(code), "hex");
    const expected = Buffer.from(row.code_digest, "hex");
    if (!timingSafeEqual(actual, expected)) {
      await client.query("COMMIT"); throw failures();
    }
    token = randomBytes(32).toString("base64url");
    await client.query("UPDATE portfolio_studio_challenges SET consumed_at=now() WHERE id=$1::uuid", [id]);
    await client.query("INSERT INTO portfolio_studio_sessions(token_digest,owner_id,expires_at) VALUES($1,$2,now()+interval '8 hours')", [hash(token), row.owner_id]);
    await client.query("COMMIT");
  } catch (error) {
    if (token) await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { client.release(); }
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.set("Set-Cookie", COOKIE + "=" + token + "; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800" + secure);
  response.json({ authenticated: true });
}
