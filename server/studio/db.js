import pg from "pg";
import path from "node:path";
import { mkdir, readFile } from "node:fs/promises";
import { DEFAULT_PORTFOLIO } from "./content.js";
import { applyStudioMigrations, assertStudioSchema } from "./migrations.js";
import { mediaDirectory } from "./media.js";

// PostgreSQL is the source of truth for normal production. The separate, read-only
// family preview runs only from the user's exported PUBLIC portfolio snapshot.
let pool;
let initialized;
let previewContent;

export function studioPool() {
  if (process.env.PORTFOLIO_PREVIEW_MODE === "true") return null;
  if (!process.env.DATABASE_URL) return null;
  pool ||= new pg.Pool({
    connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 2500,
    idleTimeoutMillis: 10000, query_timeout: 10000,
  });
  return pool;
}
export async function initializeStudio() {
  if (process.env.PORTFOLIO_PREVIEW_MODE === "true") return null;
  if (initialized) return initialized;
  const db = studioPool();
  if (!db) return null;
  initialized = (async () => {
    if (process.env.NODE_ENV === "production") {
      await assertStudioSchema(db);
    } else {
      // Preserve the no-extra-step experience for existing Windows development.
      await applyStudioMigrations(db);
    }
    await mkdir(mediaDirectory(), { recursive: true });
  })();
  try { await initialized; } catch (error) { initialized = null; throw error; }
  return db;
}
export async function getStudioContent() {
  if (process.env.PORTFOLIO_PREVIEW_MODE === "true") {
    previewContent ||= JSON.parse(await readFile(path.resolve("preview/content.json"), "utf8"));
    return { content: previewContent, version: 1 };
  }
  const db = studioPool();
  if (!db) return { content: DEFAULT_PORTFOLIO, version: 0 };
  await initializeStudio();
  const data = await db.query("SELECT payload,version FROM portfolio_studio_content WHERE id=1");
  return { content: data.rows[0]?.payload || DEFAULT_PORTFOLIO, version: Number(data.rows[0]?.version || 1) };
}

export async function closeStudio() {
  if (pool) { await pool.end(); pool = undefined; initialized = null; }
}
