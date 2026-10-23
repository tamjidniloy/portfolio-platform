import { createHash } from "node:crypto";
import { assertCandidateDatabase } from "./candidate-only.js";

const MIGRATION_ID_PATTERN = /^[0-9]{4}_[a-z0-9_]+$/;
const LOCK_ID = "457174103201"; // Arbitrary fixed project advisory lock ID.

export function migrationChecksum(sql) {
  if (typeof sql !== "string" || !sql.trim()) throw new TypeError("Migration SQL required");
  return createHash("sha256").update(sql, "utf8").digest("hex");
}

function validatePlan(migrations) {
  if (!Array.isArray(migrations) || !migrations.length) throw new TypeError("Migration plan required");
  let previous = "";
  for (const entry of migrations) {
    if (!entry || typeof entry.id !== "string" ||
        !MIGRATION_ID_PATTERN.test(entry.id) ||
        entry.id <= previous || typeof entry.sql !== "string" || !entry.sql.trim()) {
      throw new TypeError("Migrations must use ordered unique immutable IDs and SQL");
    }
    // Bare scripts with transaction control would break the atomic ledger.
    if (/^\s*(?:BEGIN|COMMIT|ROLLBACK)\s*;/im.test(entry.sql)) {
      throw new TypeError("Migration files must not issue transaction controls");
    }
    previous = entry.id;
  }
}

export async function applyCandidateMigrations(pool, { databaseUrl, migrations, mode = process.env.NODE_ENV } = {}) {
  assertCandidateDatabase(databaseUrl, mode);
  validatePlan(migrations);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)", [LOCK_ID]);
    await client.query(`CREATE TABLE IF NOT EXISTS devfolio_schema_migrations (
      id text PRIMARY KEY,
      checksum_sha256 text NOT NULL CHECK (checksum_sha256 ~ '^[a-f0-9]{64}$'),
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const history = await client.query(
      "SELECT id, checksum_sha256 FROM devfolio_schema_migrations ORDER BY id",
    );
    const prior = new Map(history.rows.map((row) => [row.id, row.checksum_sha256]));
    const ids = new Set(migrations.map((entry) => entry.id));
    for (const [id] of prior) {
      if (!ids.has(id)) throw new Error("Migration history missing from source plan");
    }
    const applied = [];
    const unchanged = [];
    for (const entry of migrations) {
      const checksum = migrationChecksum(entry.sql);
      if (prior.has(entry.id)) {
        if (prior.get(entry.id) !== checksum) {
          throw new Error("Migration checksum drift: an applied file was changed");
        }
        unchanged.push(entry.id);
        continue;
      }
      // Prevent out-of-order insert of a migration before an already applied higher version.
      if (history.rows.length && entry.id < history.rows[history.rows.length - 1].id) {
        throw new Error("Refusing out-of-order migration");
      }
      await client.query(entry.sql);
      await client.query(
        "INSERT INTO devfolio_schema_migrations(id, checksum_sha256) VALUES ($1, $2)",
        [entry.id, checksum],
      );
      applied.push(entry.id);
    }
    await client.query("COMMIT");
    return Object.freeze({ applied: Object.freeze(applied), unchanged: Object.freeze(unchanged) });
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch { /* Preserve original error. */ }
    throw error;
  } finally {
    client.release();
  }
}
