import assert from "node:assert/strict";

const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";

async function get(path) {
  const response = await fetch(new URL(path, base));
  return { response, body: await response.text() };
}

const home = await get("/");
assert.equal(home.response.status, 200, "SSR homepage must succeed");
assert.match(home.body, /Built for work that speaks for itself/);
assert.match(home.body, /<html/);
assert.match(home.body, /noindex/);

const live = await get("/healthz");
assert.equal(live.response.status, 200);
assert.deepEqual(JSON.parse(live.body), { status: "ok" });
assert.equal(live.response.headers.get("cache-control"), "no-store");

const ready = await get("/readyz");
assert.equal(ready.response.status, 200, "PostgreSQL readiness must succeed");
assert.deepEqual(JSON.parse(ready.body), { status: "ready" });

const work = await get("/work");
assert.equal(work.response.status, 200, "Work prelaunch route must SSR");
assert.match(work.body, /No published content available/);
assert.match(work.body, /noindex/);

const research = await get("/research");
assert.equal(research.response.status, 200, "Research prelaunch route must SSR");

const admin = await get("/admin");
assert.equal(admin.response.status, 404, "no owner/admin page exposed before MFA signoff");

const missing = await get("/not-a-real-route");
assert.equal(missing.response.status, 404, "unknown pages must be HTTP 404");
assert.doesNotMatch(missing.body, /DATABASE_URL|password=|node_modules\//i);

console.log("SSR, live, DB-ready and 404 smoke checks passed.");
