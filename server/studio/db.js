import pg from "pg";
import { mkdir } from "node:fs/promises";
import { DEFAULT_PORTFOLIO } from "./content.js";
import { mediaDirectory } from "./media.js";

// PostgreSQL is the source of truth. This module owns its connection pool and schema initialization.
let pool;
let initialized;

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

export async function closeStudio() {
  if (pool) { await pool.end(); pool = undefined; initialized = null; }
}
