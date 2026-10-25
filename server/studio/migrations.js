import { DEFAULT_PORTFOLIO } from "./content.js";

// V1 is intentionally idempotent: existing DEVFOLIO OS owners and published content survive.
// Production runs this explicitly before each deployment; normal app startup never does DDL.
export const STUDIO_SCHEMA_VERSION = 1;

export async function applyStudioMigrations(db) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(854219556)");
    await client.query(`CREATE TABLE IF NOT EXISTS portfolio_studio_schema_migrations (
      version integer PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS portfolio_studio_content (
      id smallint PRIMARY KEY CHECK(id=1), payload jsonb NOT NULL,
      version bigint NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS portfolio_studio_owner (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text NOT NULL UNIQUE,
      password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS portfolio_studio_challenges (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id uuid NOT NULL REFERENCES portfolio_studio_owner(id) ON DELETE CASCADE,
      code_digest text NOT NULL, attempts integer NOT NULL DEFAULT 0,
      consumed_at timestamptz, expires_at timestamptz NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS portfolio_studio_sessions (
      token_digest text PRIMARY KEY,
      owner_id uuid NOT NULL REFERENCES portfolio_studio_owner(id) ON DELETE CASCADE,
      expires_at timestamptz NOT NULL, last_seen_at timestamptz NOT NULL DEFAULT now()
    )`);
    await client.query(`CREATE TABLE IF NOT EXISTS portfolio_studio_attempts (
      key_digest text PRIMARY KEY, attempts integer NOT NULL,
      reset_at timestamptz NOT NULL
    )`);
    await client.query("CREATE INDEX IF NOT EXISTS studio_challenges_expires_idx ON portfolio_studio_challenges(expires_at)");
    await client.query("CREATE INDEX IF NOT EXISTS studio_sessions_expires_idx ON portfolio_studio_sessions(expires_at)");
    await client.query("CREATE INDEX IF NOT EXISTS studio_attempts_reset_idx ON portfolio_studio_attempts(reset_at)");
    await client.query("INSERT INTO portfolio_studio_content(id,payload) VALUES(1,$1::jsonb) ON CONFLICT(id) DO NOTHING", [JSON.stringify(DEFAULT_PORTFOLIO)]);
    await client.query("INSERT INTO portfolio_studio_schema_migrations(version) VALUES($1) ON CONFLICT(version) DO NOTHING", [STUDIO_SCHEMA_VERSION]);
    await client.query("COMMIT");
  } catch(error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { client.release(); }
}

export async function assertStudioSchema(db) {
  const result = await db.query("SELECT version FROM portfolio_studio_schema_migrations ORDER BY version DESC LIMIT 1");
  const version = Number(result.rows[0]?.version || 0);
  if (version !== STUDIO_SCHEMA_VERSION) throw new Error("Portfolio Studio schema version mismatch. Run npm run db:migrate before starting the server.");
  await db.query("SELECT id FROM portfolio_studio_content WHERE id=1");
}

export async function pruneStudioRecords(db) {
  const [attempts, challenges, sessions] = await Promise.all([
    db.query("DELETE FROM portfolio_studio_attempts WHERE reset_at < now()-interval '1 day'"),
    db.query("DELETE FROM portfolio_studio_challenges WHERE expires_at < now()-interval '1 day'"),
    db.query("DELETE FROM portfolio_studio_sessions WHERE expires_at < now() OR last_seen_at < now()-interval '45 minutes'"),
  ]);
  return { attempts: attempts.rowCount, challenges: challenges.rowCount, sessions: sessions.rowCount };
}
