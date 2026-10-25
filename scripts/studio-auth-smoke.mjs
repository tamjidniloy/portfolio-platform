import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { initializeStudio, closeStudio, studioPool, createInitialOwner } from "../server/studio/index.js";
import { applyStudioMigrations } from "../server/studio/migrations.js";

// CI-only ephemeral PostgreSQL integration check: simulate a verified OTP and ensure
// its resulting HttpOnly cookie grants the React Router SSR admin loader access.
const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";
if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname)) {
  throw new Error("Authenticated smoke tests may run only against loopback.");
}
if (!process.env.PORTFOLIO_AUTH_SECRET) throw new Error("Set a CI-only PORTFOLIO_AUTH_SECRET.");
const email = "studio-auth-smoke@example.test";
const password = "ci-smoke-test-only-password-2026";
const code = "012345";

function post(path, body, cookie = "") {
  return fetch(new URL(path, base), {
    method: "POST", redirect: "manual",
    headers: {
      Origin: new URL(base).origin, "X-Studio-Request": "1",
      "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

try {
  await initializeStudio();
  const db = studioPool();
  const owners = await db.query("SELECT id FROM portfolio_studio_owner");
  assert.equal(owners.rowCount, 0, "Use a fresh disposable CI database for auth smoke tests");
  await createInitialOwner(email, password);
  // Repeat the migration on existing real owner state: migration must never replace credentials.
  await applyStudioMigrations(db);
  const preserved = await db.query("SELECT email FROM portfolio_studio_owner");
  assert.equal(preserved.rows[0]?.email, email, "Migration must preserve the existing owner");

  const wrongPassword = await post("/api/studio/login/start", { email, password: "not-the-password" });
  assert.equal(wrongPassword.status, 401, "Wrong password must not start owner login");

  const owner = await db.query("SELECT id FROM portfolio_studio_owner WHERE email=$1", [email]);
  assert.equal(owner.rowCount, 1);
  const codeDigest = createHmac("sha256", process.env.PORTFOLIO_AUTH_SECRET).update(code).digest("hex");
  const challenge = await db.query(
    "INSERT INTO portfolio_studio_challenges(owner_id,code_digest,expires_at) VALUES($1,$2,now()+interval '10 minutes') RETURNING id",
    [owner.rows[0].id, codeDigest],
  );

  const verified = await post("/api/studio/login/verify", { challengeId: challenge.rows[0].id, code });
  assert.equal(verified.status, 200, "A correct OTP must be accepted");
  assert.equal((await verified.json()).authenticated, true);
  const setCookie = verified.headers.get("set-cookie") || "";
  assert.match(setCookie, /^portfolio_owner=[A-Za-z0-9_-]{43};/);
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  const cookie = setCookie.split(";")[0];

  const session = await fetch(new URL("/api/studio/session", base), { headers: { Cookie: cookie } });
  assert.equal(session.status, 200);
  assert.equal((await session.json()).authenticated, true, "Express API must accept the session cookie");

  const anonymous = await fetch(new URL("/admin", base), { redirect: "manual" });
  assert.equal(anonymous.status, 302, "Anonymous admin access must redirect to login");

  const admin = await fetch(new URL("/admin", base), { headers: { Cookie: cookie }, redirect: "manual" });
  assert.equal(admin.status, 200, "React Router SSR must grant admin access after OTP login");
  assert.match(await admin.text(), /Publish updates/, "Authenticated owner must see the editor");

  const login = await fetch(new URL("/admin/login", base), { headers: { Cookie: cookie }, redirect: "manual" });
  assert.equal(login.status, 302, "Authenticated owner visiting login must redirect to admin");
  assert.equal(login.headers.get("location"), "/admin");

  // End-to-end publishing: the same cookie that unlocked SSR must authorize
  // optimistic-version updates, expose the new public text, and reject stale edits.
  const initial = await db.query("SELECT payload, version FROM portfolio_studio_content WHERE id=1");
  // CI-only sample proves the CMS-to-SSR case-study path without adding fake production data.
  const example = {
    id: "ci-case-study", title: "CI Project Atlas", category: "Engineering",
    description: "An integration fixture for project storytelling.",
    year: "2026", cover: "", stack: "React, Node.js", liveUrl: "",
    sourceUrl: "", featured: true,
    role: "UI and quality assurance", challenge: "Make complex work understandable.",
    approach: "Choose progressive disclosure instead of overwhelming visitors.",
    architecture: "SSR pages read published CMS content through the existing service boundary.",
    outcome: "Verified project navigation and detail rendering.",
    lessons: "Test the visitor journey in a real browser.",
  };
  const published = {
    ...initial.rows[0].payload, name: "CI Published Developer",
    projects: [...initial.rows[0].payload.projects, example],
  };
  const update = await fetch(new URL("/api/studio/content", base), {
    method: "PUT",
    headers: {
      Origin: new URL(base).origin, "X-Studio-Request": "1",
      "Content-Type": "application/json", Cookie: cookie,
    },
    body: JSON.stringify({ content: published, version: Number(initial.rows[0].version) }),
  });
  assert.equal(update.status, 200, "Owner must be able to publish");
  const changed = await fetch(new URL("/api/studio/public", base));
  assert.equal((await changed.json()).name, "CI Published Developer", "Published content must be publicly visible");
  const conflict = await fetch(new URL("/api/studio/content", base), {
    method: "PUT",
    headers: {
      Origin: new URL(base).origin, "X-Studio-Request": "1",
      "Content-Type": "application/json", Cookie: cookie,
    },
    body: JSON.stringify({ content: published, version: Number(initial.rows[0].version) }),
  });
  assert.equal(conflict.status, 409, "Optimistic concurrency prevents overwriting other edits");

  const replay = await post("/api/studio/login/verify", { challengeId: challenge.rows[0].id, code });
  assert.equal(replay.status, 401, "An OTP cannot be reused");

  const logout = await post("/api/studio/logout", {}, cookie);
  assert.equal(logout.status, 204);
  const afterLogout = await fetch(new URL("/api/studio/session", base), { headers: { Cookie: cookie } });
  assert.equal((await afterLogout.json()).authenticated, false, "Logged-out owner session is invalidated");

  console.info("OTP verification -> session cookie -> SSR /admin -> logout integration passed.");
} finally {
  await closeStudio();
}
