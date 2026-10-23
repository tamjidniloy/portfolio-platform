import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { applyCandidateMigrations, migrationChecksum } from "../../server/persistence/candidate-migrator.js";
import { loadCandidateMigrationPlan } from "../../server/persistence/candidate-plan.js";

test("migration checksums are deterministic and candidate guard fails closed", async () => {
  assert.equal(migrationChecksum("SELECT 1").length, 64);
  const guardDb = { connect() { throw new Error("database must never connect"); } };
  const plan = await loadCandidateMigrationPlan();
  for (const url of [
    undefined, "postgresql://x:y@host.example.com/devfolio_candidate_migration_ci",
    "postgresql://x:y@127.0.0.1/devfolio_dev",
  ]) {
    await assert.rejects(
      applyCandidateMigrations(guardDb, { databaseUrl: url, migrations: plan, mode: "test" }),
    );
  }
  await assert.rejects(
    applyCandidateMigrations(guardDb, {
      databaseUrl: "postgresql://x:y@localhost/devfolio_candidate_migration_ci",
      migrations: plan,
      mode: "production",
    }),
  );
});

test("isolated SQL baseline, checksum drift, ordering, transaction rollback, replay", async (t) => {
  const url = process.env.CANDIDATE_MIGRATION_DATABASE_URL;
  assert.ok(url, "CANDIDATE_MIGRATION_DATABASE_URL must be configured for this isolated integration suite");
  const pool = new pg.Pool({ connectionString: url, max: 5, connectionTimeoutMillis: 1500 });
  t.after(async () => pool.end());
  const plan = await loadCandidateMigrationPlan();

  await t.test("broken SQL is rolled back with the migration ledger in one transaction", async () => {
    const malicious = [{ id: "0001_fail_first", sql: "CREATE TABLE test_partial (id integer); SELECT no_such_column FROM no_such_table;" }];
    await assert.rejects(applyCandidateMigrations(pool, { databaseUrl: url, migrations: malicious, mode: "test" }));
    const marker = await pool.query("SELECT to_regclass('public.test_partial') AS name");
    assert.equal(marker.rows[0].name, null, "DDL created in failed transaction must disappear");
    const ledger = await pool.query("SELECT to_regclass('public.devfolio_schema_migrations') AS name");
    assert.equal(ledger.rows[0].name, null, "migration ledger must also roll back");
  });

  await t.test("the full proposed Phase 03 DDL applies and tracks 18 base tables + ledger", async () => {
    const outcome = await applyCandidateMigrations(pool, { databaseUrl: url, migrations: plan, mode: "test" });
    assert.deepEqual(outcome.applied, ["0001_phase03_proposed_baseline"]);
    assert.deepEqual(outcome.unchanged, []);
    const tables = await pool.query(
      "SELECT COUNT(*)::int AS n FROM pg_tables WHERE schemaname='public'",
    );
    assert.equal(tables.rows[0].n, 19);
    const ledger = await pool.query("SELECT checksum_sha256 FROM devfolio_schema_migrations");
    assert.equal(ledger.rows[0].checksum_sha256, migrationChecksum(plan[0].sql));
  });

  await t.test("re-run is idempotent; concurrency is serialized", async () => {
    const outcomes = await Promise.all([
      applyCandidateMigrations(pool, { databaseUrl: url, migrations: plan, mode: "test" }),
      applyCandidateMigrations(pool, { databaseUrl: url, migrations: plan, mode: "test" }),
    ]);
    for (const result of outcomes) {
      assert.deepEqual(result.applied, []);
      assert.deepEqual(result.unchanged, ["0001_phase03_proposed_baseline"]);
    }
    assert.equal((await pool.query("SELECT COUNT(*)::int AS n FROM devfolio_schema_migrations")).rows[0].n, 1);
  });

  await t.test("tampered migrations and missing history fail rather than silently rewriting SQL", async () => {
    await assert.rejects(applyCandidateMigrations(pool, {
      databaseUrl: url,
      migrations: [{ ...plan[0], sql: plan[0].sql + "\n-- unauthorized change" }],
      mode: "test",
    }), /Migration checksum drift/);
    await assert.rejects(applyCandidateMigrations(pool, {
      databaseUrl: url,
      migrations: [{ id: "0002_unrelated", sql: "SELECT 1;" }],
      mode: "test",
    }), /history missing from source plan/);
  });

  await t.test("later broken migration fails without leaving partial table or history", async () => {
    const brokenPlan = [...plan, {
      id: "0002_future_broken",
      sql: "CREATE TABLE test_future_partial (id integer); SELECT no_such_column FROM no_such_table;",
    }];
    await assert.rejects(applyCandidateMigrations(pool, {
      databaseUrl: url, migrations: brokenPlan, mode: "test",
    }));
    const marker = await pool.query("SELECT to_regclass('public.test_future_partial') AS name");
    assert.equal(marker.rows[0].name, null);
    assert.equal((await pool.query("SELECT COUNT(*)::int AS n FROM devfolio_schema_migrations")).rows[0].n, 1);
  });
});
