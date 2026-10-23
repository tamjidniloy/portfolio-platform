import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { assertOwnedResource } from "../server/identity/owner-access.js";
import { OwnerNotAuthorized } from "../server/identity/session-store.js";

test("untrusted actors cannot access a resource by forging an ownerId property", () => {
  assert.throws(() => assertOwnedResource({ ownerId: "owner", expiresAt: new Date(Date.now()+60_000) }, { created_by:"owner" }), OwnerNotAuthorized);
  assert.throws(() => assertOwnedResource(null, { created_by:"owner" }), OwnerNotAuthorized);
});

test("unapproved owner auth HTTP routes are not present in the active server/router", async () => {
  const routes = await readFile("app/routes.js","utf8");
  const server = await readFile("server.js","utf8");
  assert.doesNotMatch(routes, /admin\/login|admin\/recover|auth\/password|auth\/email/);
  assert.doesNotMatch(server, /app\.post\(["']\/api\/v1\/auth|app\.get\(["']\/admin\/login/);
});
