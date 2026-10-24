import assert from "node:assert/strict";

const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";

async function get(path) {
  const response = await fetch(new URL(path, base));
  return { response, body: await response.text() };
}

const home = await get("/");
assert.equal(home.response.status, 200, "SSR homepage must succeed");
assert.match(home.body, /Thoughtful code\. Remarkable experiences\./);
assert.match(home.body, /href="\/admin\/login"/, "Public visitors can see the Login link");
assert.match(home.body, /<html/);
assert.match(home.body, /noindex/);
assert.equal(home.response.headers.get("x-frame-options"), "DENY");
assert.equal(home.response.headers.get("cache-control"), "no-store");

const live = await get("/healthz");
assert.equal(live.response.status, 200);
assert.deepEqual(JSON.parse(live.body), { status: "ok" });
assert.equal(live.response.headers.get("cache-control"), "no-store");

const ready = await get("/readyz");
assert.equal(ready.response.status, 200, "PostgreSQL readiness must succeed");
assert.deepEqual(JSON.parse(ready.body), { status: "ready" });

const work = await get("/work");
assert.equal(work.response.status, 200, "Legacy Work redirects to canonical Projects");
const workRedirect = await fetch(new URL("/work", base), { redirect: "manual" });
assert.equal(workRedirect.status, 308);
assert.equal(workRedirect.headers.get("location"), "/projects");
const projects = await get("/projects");
assert.equal(projects.response.status, 200);
assert.match(projects.body, /No published projects available/);

const research = await get("/research");
assert.equal(research.response.status, 200, "Research prelaunch route must SSR");

const login = await get("/admin/login");
assert.equal(login.response.status, 200, "Public login form is available without granting owner access");
assert.match(login.body, /Welcome back\./);

const passwordApi = await get("/api/v1/auth/password");
assert.equal(passwordApi.response.status, 404, "no unapproved password API is exposed");

const admin = await get("/admin");
assert.equal(admin.response.status, 200, "Anonymous request is redirected to public login form");
const adminRedirect = await fetch(new URL("/admin", base), { redirect: "manual" });
assert.equal(adminRedirect.status, 302, "Anonymous cannot access editor without a session");
assert.equal(adminRedirect.headers.get("location"), "/admin/login");
assert.doesNotMatch(admin.body, /Publish updates/, "The private editor is not served anonymously");

const missing = await get("/not-a-real-route");
assert.equal(missing.response.status, 404, "unknown pages must be HTTP 404");
assert.doesNotMatch(missing.body, /DATABASE_URL|password=|node_modules\//i);

console.log("SSR, live, DB-ready and 404 smoke checks passed.");
