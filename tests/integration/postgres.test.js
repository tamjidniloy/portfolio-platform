import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { createDatabaseReadiness } from "../../server/database.js";

test("native PostgreSQL connection and query succeed without application migrations", async () => {
  assert.ok(process.env.DATABASE_URL, "Configure DATABASE_URL before integration testing");
  const adapter = createDatabaseReadiness(process.env.DATABASE_URL);
  try {
    assert.equal(await adapter.check(), true);
  } finally {
    await adapter.close();
  }
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 1500 });
  try {
    const result = await pool.query("SELECT current_database() AS name, current_user AS actor");
    assert.equal(result.rows.length, 1);
    assert.ok(result.rows[0].name);
    assert.ok(result.rows[0].actor);
  } finally {
    await pool.end();
  }
});
