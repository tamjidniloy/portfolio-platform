import assert from "node:assert/strict";
import test from "node:test";
import { readConfig } from "../server/config.js";

test("development defaults are local and secret-free", () => {
  const config = readConfig({});
  assert.equal(config.mode, "development");
  assert.equal(config.port, 3000);
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.databaseUrl, null);
  assert.ok(Object.isFrozen(config));
});

test("production binds to container interface by default", () => {
  const config = readConfig({ NODE_ENV: "production", PORT: "8080" });
  assert.equal(config.host, "0.0.0.0");
  assert.equal(config.port, 8080);
  assert.equal(config.isProduction, true);
});

test("rejects unsafe or malformed configuration", () => {
  for (const env of [
    { PORT: "0" },
    { PORT: "65536" },
    { PORT: "123abc" },
    { HOST: "a\nInjected" },
    { NODE_ENV: "debug" },
    { DATABASE_URL: "https://example.test" },
  ]) {
    assert.throws(() => readConfig(env));
  }
});

test("accepts PostgreSQL URLs but never prints them", () => {
  const value = "postgresql://user:example@127.0.0.1:5432/devfolio";
  assert.equal(readConfig({ DATABASE_URL: value }).databaseUrl, value);
});
