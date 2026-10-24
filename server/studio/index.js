import express from "express";
import pg from "pg";
import { createHash, createHmac, randomBytes, randomInt, scrypt as rawScrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_PORTFOLIO, validatePortfolio } from "./content.js";

const scrypt = promisify(rawScrypt);
const COOKIE = "portfolio_owner";
let pool;
let initialized;
const hash = (value) => createHash("sha256").update(value).digest("hex");
const authKey = () => {
  const value = process.env.PORTFOLIO_AUTH_SECRET;
  if (!value || value.startsWith("REPLACE_WITH") || Buffer.byteLength(value) < 32) throw new StudioError(503, "Set PORTFOLIO_AUTH_SECRET (32+ random characters) in .env");
  return value;
};
const digest = (value) => createHmac("sha256", authKey()).update(value).digest("hex");
const failures = (code = 401, message = "Invalid credentials or verification code") => new StudioError(code, message);
class StudioError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function studioPool() {
  if (!process.env.DATABASE_URL) return null;
  pool ||= new pg.Pool({
    connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 2500,
    idleTimeoutMillis: 10000, query_timeout: 10000,
  });
  return pool;
}
export function mediaDirectory() {
  return path.resolve(process.env.PORTFOLIO_UPLOAD_DIR || "data/uploads");
}
export async function initializeStudio() {
  if (initialized) return initialized;
  const db = studioPool();
  if (!db) return null;
  initialized = (async () => {
    await db.query("CREATE TABLE IF NOT EXISTS portfolio_studio_content (id smallint PRIMARY KEY CHECK(id=1), payload jsonb NOT NULL, version bigint NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS portfolio_studio_owner (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS portfolio_studio_challenges (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES portfolio_studio_owner(id) ON DELETE CASCADE, code_digest text NOT NULL, attempts integer NOT NULL DEFAULT 0, consumed_at timestamptz, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS portfolio_studio_sessions (token_digest text PRIMARY KEY, owner_id uuid NOT NULL REFERENCES portfolio_studio_owner(id) ON DELETE CASCADE, expires_at timestamptz NOT NULL, last_seen_at timestamptz NOT NULL DEFAULT now())");
    await db.query("CREATE TABLE IF NOT EXISTS portfolio_studio_attempts (key_digest text PRIMARY KEY, attempts integer NOT NULL, reset_at timestamptz NOT NULL)");
    await db.query("INSERT INTO portfolio_studio_content(id,payload) VALUES(1,$1::jsonb) ON CONFLICT(id) DO NOTHING", [JSON.stringify(DEFAULT_PORTFOLIO)]);
    await mkdir(mediaDirectory(), { recursive: true });
  })();
  try { await initialized; } catch (error) { initialized = null; throw error; }
  return db;
}
export async function getStudioContent() {
  const db = studioPool();
  if (!db) return { content: DEFAULT_PORTFOLIO, version: 0 };
  await initializeStudio();
  const data = await db.query("SELECT payload,version FROM portfolio_studio_content WHERE id=1");
  return { content: data.rows[0]?.payload || DEFAULT_PORTFOLIO, version: Number(data.rows[0]?.version || 1) };
}
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
function allowedOrigin(request) {
  const submitted = request.headers.origin;
  const configured = process.env.PORTFOLIO_PUBLIC_ORIGIN || process.env.CMS_PUBLIC_ORIGIN || "http://127.0.0.1:3000";
  const allowed = [new URL(configured).origin];
  if (process.env.NODE_ENV !== "production") allowed.push("http://127.0.0.1:3000", "http://localhost:3000");
  return typeof submitted === "string" && allowed.includes(submitted) && request.get("sec-fetch-site") !== "cross-site";
}
function cookieToken(request) {
  const value = request.headers.cookie;
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
async function throttle(key, max, windowSeconds) {
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
async function beginLogin(request, response) {
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
async function verifyLogin(request, response) {
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
const fileType = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
};
export function createStudioRouter() {
  const router = express.Router();
  const json = express.json({ limit: "180kb" });
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  router.get("/public", wrap(async (_req, res) => res.json((await getStudioContent()).content)));
  router.get("/session", wrap(async (req, res) => res.json({ authenticated: Boolean(await studioSession(req)) })));
  router.use((req, _res, next) => {
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method) && (!allowedOrigin(req) || req.get("X-Studio-Request") !== "1")) {
      next(new StudioError(403, "Invalid request origin")); return;
    }
    next();
  });
  router.post("/login/start", json, wrap(beginLogin));
  router.post("/login/verify", json, wrap(verifyLogin));
  // Authorization must finish BEFORE calling next(): no mutation may bypass this check.
  const owner = (req, _res, next) => {
    studioSession(req).then((session) => {
      if (!session) throw failures();
      req.studioOwner = session;
      next();
    }).catch(next);
  };
  router.post("/logout", owner, wrap(async (req, res) => {
    await studioPool().query("DELETE FROM portfolio_studio_sessions WHERE token_digest=$1", [hash(req.studioOwner.token)]);
    res.set("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
    res.status(204).end();
  }));
  router.put("/content", owner, json, wrap(async (req, res) => {
    const content = validatePortfolio(req.body?.content);
    const expected = req.body?.version;
    if (!Number.isSafeInteger(expected) || expected < 1) throw new StudioError(422, "Invalid content version");
    const result = await studioPool().query(
      "UPDATE portfolio_studio_content SET payload=$1::jsonb,version=version+1,updated_at=now() WHERE id=1 AND version=$2 RETURNING version",
      [JSON.stringify(content), expected],
    );
    if (!result.rowCount) throw new StudioError(409, "Content changed in another tab. Refresh before saving.");
    res.json({ saved: true, version: Number(result.rows[0].version) });
  }));
  router.post("/upload", owner, express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }), wrap(async (req, res) => {
    if (!Buffer.isBuffer(req.body) || req.body.length < 16 || req.body.length > 5 * 1024 * 1024) throw new StudioError(422, "Upload a JPG, PNG or WebP image under 5 MB");
    const extension = fileType(req.body);
    if (!extension) throw new StudioError(422, "Unsupported image file contents");
    const filename = randomBytes(16).toString("hex") + "." + extension;
    await mkdir(mediaDirectory(), { recursive: true });
    await writeFile(path.join(mediaDirectory(), filename), req.body, { flag: "wx", mode: 0o644 });
    res.status(201).json({ url: "/media/" + filename });
  }));
  router.use((error, _req, res, _next) => {
    const status = error.status >= 400 && error.status < 600 ? error.status : 500;
    if (status === 500) console.error("Portfolio studio request failed:", error);
    res.status(status).json({ error: status === 500 ? "Something went wrong. Try again." : error.message });
  });
  return router;
}
export async function serveStudioImage(request, response) {
  const name = request.params.name;
  if (!/^[a-f0-9]{32}\.(png|jpg|webp)$/.test(name)) { response.status(404).end(); return; }
  try {
    const bytes = await readFile(path.join(mediaDirectory(), name));
    response.type(name.endsWith(".png") ? "image/png" : name.endsWith(".jpg") ? "image/jpeg" : "image/webp");
    response.set("Cache-Control", "public, max-age=31536000, immutable").send(bytes);
  } catch { response.status(404).end(); }
}
export async function closeStudio() {
  if (pool) { await pool.end(); pool = undefined; initialized = null; }
}
