import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertOwnedResource } from "../server/identity/owner-access.js";
import { OwnerNotAuthorized } from "../server/identity/session-store.js";

test("untrusted actors cannot access a resource by forging an ownerId property", () => {
  assert.throws(() => assertOwnedResource({ ownerId: "owner", expiresAt: new Date(Date.now()+60_000) }, { created_by:"owner" }), OwnerNotAuthorized);
  assert.throws(() => assertOwnedResource(null, { created_by:"owner" }), OwnerNotAuthorized);
});

test("approved passkey routes are feature gated and password/email auth stays absent", async () => {
  const routes = await readFile("app/routes.js","utf8");
  const server = await readFile("server.js","utf8");
  assert.match(routes, /admin\/login/);
  assert.match(server, /CMS_AUTH_ENABLED === "true"/);
  assert.doesNotMatch(server, /auth\/password|auth\/email/);
  assert.doesNotMatch(server, /app\.post\(["']\/api\/v1\/auth|app\.get\(["']\/admin\/login/);
});
