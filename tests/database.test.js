import assert from "node:assert/strict";
import test from "node:test";
import { createDatabaseReadiness } from "../server/database.js";

test("missing database configuration is unready, without connecting", async () => {
  const adapter = createDatabaseReadiness(null, () => {
    throw new Error("Must not be called");
  });
  assert.equal(await adapter.check(), false);
  await adapter.close();
});

test("configured probe queries SELECT 1 and closes the pool", async () => {
  const calls = [];
  const adapter = createDatabaseReadiness("postgresql://example.test/devfolio", (options) => {
    assert.equal(options.max, 2);
    assert.equal(options.connectionTimeoutMillis, 1000);
    return {
      async query(text) {
        calls.push(text);
      },
      async end() {
        calls.push("close");
      },
    };
  });
  assert.equal(await adapter.check(), true);
  await adapter.close();
  assert.deepEqual(calls, ["SELECT 1", "close"]);
});
