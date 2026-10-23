import pg from "pg";
import { applyCandidateMigrations } from "../server/persistence/candidate-migrator.js";
import { loadCandidateMigrationPlan } from "../server/persistence/candidate-plan.js";

// Intentionally never accept DATABASE_URL. This CLI only works against a named,
// localhost, disposable candidate DB and refuses NODE_ENV=production.
const databaseUrl = process.env.CANDIDATE_MIGRATION_DATABASE_URL;
const pool = new pg.Pool({
  connectionString: databaseUrl,
  max: 1,
  connectionTimeoutMillis: 1500,
  query_timeout: 10000,
});
try {
  const migrations = await loadCandidateMigrationPlan();
  const outcome = await applyCandidateMigrations(pool, { databaseUrl, migrations });
  console.info("Disposable candidate DB migration validation:", outcome);
} catch (error) {
  console.error("Candidate migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
