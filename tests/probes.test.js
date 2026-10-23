import assert from "node:assert/strict";
import test from "node:test";
import { createReadinessHandler, createApplicationReadiness, livenessHandler } from "../server/probes.js";

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

test("CMS and public reader are both mandatory when enabled", async () => {
  let baseCalls = 0;
  let privateCalls = 0;
  let publicCalls = 0;
  const baseCheck = async () => { baseCalls++; return true; };
  const cmsPool = { query: async () => { privateCalls++; return {rows:[{"?column?":1}]}; } };
  const publicPool = { query: async () => { publicCalls++; return {rows:[{"?column?":1}]}; } };
  const check = createApplicationReadiness({baseCheck, cmsPool, publicPool});
  assert.equal(await check(), true);
  assert.deepEqual([baseCalls,privateCalls,publicCalls], [1,1,1]);
});
test("production public reader outage returns 503 even if main and CMS DB work", async () => {
  const check = createApplicationReadiness({
    baseCheck: async () => true,
    cmsPool: {query: async () => ({rows:[]})},
    publicPool: {query: async () => {throw new Error("private provider secret");}},
  });
  const response = responseDouble();
  await createReadinessHandler(check)({},response);
  assert.equal(response.code,503);
  assert.deepEqual(response.body,{status:"unavailable"});
});
test("general DB failure and CMS failure separately fail closed", async () => {
  const cmsPool = {query: async () => ({rows:[]})};
  assert.equal(await createApplicationReadiness({baseCheck:async()=>false,cmsPool})(),false);
  assert.equal(await createApplicationReadiness({baseCheck:async()=>true,cmsPool:{query:async()=>{throw Error("secret")}}})(),false);
});
test("public reader shares private pool only in dev and is queried once", async () => {
  let calls=0;
  const shared={query:async()=>{calls++;return {rows:[]}}};
  assert.equal(await createApplicationReadiness({baseCheck:async()=>true,cmsPool:shared,publicPool:shared})(),true);
  assert.equal(calls,1);
});
