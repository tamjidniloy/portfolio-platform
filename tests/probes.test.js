import assert from "node:assert/strict";
import test from "node:test";
import { createReadinessHandler, livenessHandler } from "../server/probes.js";

function responseDouble() {
  return {
    headers: {},
    code: null,
    body: null,
    set(key, value) {
      this.headers[key] = value;
      return this;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("liveness is minimal, uncached and does not depend on DB", () => {
  const response = responseDouble();
  livenessHandler({}, response);
  assert.equal(response.code, 200);
  assert.deepEqual(response.body, { status: "ok" });
  assert.equal(response.headers["Cache-Control"], "no-store");
});

test("ready only after successful DB check", async () => {
  const response = responseDouble();
  await createReadinessHandler(async () => true)({}, response);
  assert.equal(response.code, 200);
  assert.deepEqual(response.body, { status: "ready" });
});

test("missing DB and failure are both fail-closed with no details", async () => {
  for (const check of [
    async () => false,
    async () => {
      throw new Error("private connection string: NEVER_RETURN");
    },
  ]) {
    const response = responseDouble();
    await createReadinessHandler(check)({}, response);
    assert.equal(response.code, 503);
    assert.deepEqual(response.body, { status: "unavailable" });
    assert.equal(JSON.stringify(response.body).includes("NEVER_RETURN"), false);
  }
});
