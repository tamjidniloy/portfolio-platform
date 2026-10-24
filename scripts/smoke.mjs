import assert from "node:assert/strict";

const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";
const request = (path, init) => fetch(new URL(path, base), { redirect: "manual", ...init });

const home = await request("/");
assert.equal(home.status, 200, "Public portfolio must render with SSR");
const markup = await home.text();
assert.match(markup, /href="\/admin\/login"/, "Owner login must be visible");
assert.match(markup, /<html/);
assert.equal(home.headers.get("x-frame-options"), "DENY");

const health = await request("/healthz");
assert.equal(health.status, 200);
assert.deepEqual(await health.json(), { status: "ok" });

const ready = await request("/readyz");
assert.equal(ready.status, 200);
assert.deepEqual(await ready.json(), { status: "ready" });

const publicContent = await request("/api/studio/public");
assert.equal(publicContent.status, 200);
assert.equal(typeof (await publicContent.json()).name, "string");

const session = await request("/api/studio/session");
assert.equal(session.status, 200);
assert.equal((await session.json()).authenticated, false);

const login = await request("/admin/login");
assert.equal(login.status, 200);
assert.match(await login.text(), /Welcome back/);

const admin = await request("/admin");
assert.equal(admin.status, 302, "Anonymous users must be redirected");
assert.equal(admin.headers.get("location"), "/admin/login");

const denied = await request("/api/studio/content", {
  method: "PUT",
  headers: { Origin: new URL(base).origin, "X-Studio-Request": "1", "Content-Type": "application/json" },
  body: JSON.stringify({ content: {}, version: 1 }),
});
assert.equal(denied.status, 401, "Unauthenticated users cannot publish");

const invalidOrigin = await request("/api/studio/login/start", {
  method: "POST",
  headers: { Origin: "https://untrusted.example.test", "X-Studio-Request": "1", "Content-Type": "application/json" },
  body: "{}",
});
assert.equal(invalidOrigin.status, 403, "Invalid cross-origin mutations are denied");

const projects = await request("/projects");
assert.equal(projects.status, 302, "Old project listing links should redirect to the new homepage section");
assert.equal(projects.headers.get("location"), "/#work");
const contact = await request("/contact");
assert.equal(contact.status, 302);
assert.equal(contact.headers.get("location"), "/#contact");

const robots = await request("/robots.txt");
assert.equal(robots.status, 200);
assert.match(await robots.text(), /Disallow: \/|Sitemap:/);

const missing = await request("/not-a-real-page");
assert.equal(missing.status, 404, "Unknown paths must return 404");

console.log("Portfolio Studio public SSR, security, health and anonymous HTTP smoke passed.");
