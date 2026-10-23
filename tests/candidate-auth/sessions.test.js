/**
 * Candidate auth persistence integration, using ONLY CI's disposable database.
 * This suite runs after Phase 04.1 candidate DDL tests created 18 tables.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import pg from "pg";
import { assertCandidateDatabase } from "../../server/persistence/candidate-only.js";
import {
  createSessionForVerifiedOwner, resolveOwnerSession, rotateOwnerSession,
  revokeOwnerSession, revokeAllOwnerSessions, OwnerNotAuthorized, assertVerifiedOwner,
} from "../../server/identity/session-store.js";
import { digestSessionToken } from "../../server/identity/session-tokens.js";
import { assertOwnedResource } from "../../server/identity/owner-access.js";

test("isolated Phase 04.2 session lifecycle and authorization (candidate schema only)", async (t) => {
  const databaseUrl = process.env.CANDIDATE_DATABASE_URL;
  assertCandidateDatabase(databaseUrl, process.env.NODE_ENV);
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 1500 });
  t.after(async () => pool.end());

  // Account creation in test fixture is NOT application owner provisioning.
  const owner = await pool.query(
    "INSERT INTO admin_users(email,password_hash) VALUES($1,$2) RETURNING id",
    [`test-${randomUUID()}@invalid.example`, "TEST_FIXTURE_NO_REAL_PASSWORD"],
  );
  const ownerId = owner.rows[0].id;
  const other = await pool.query(
    "INSERT INTO admin_users(email,password_hash) VALUES($1,$2) RETURNING id",
    [`test-${randomUUID()}@invalid.example`, "TEST_FIXTURE_NO_REAL_PASSWORD"],
  );
  const otherId = other.rows[0].id;

  await t.test("session issuance stores only SHA-256 digest and verifies owner in database", async () => {
    const issued = await createSessionForVerifiedOwner(pool, { ownerId });
    assert.equal(issued.token.length, 43);
    const stored = await pool.query(
      "SELECT token_digest FROM admin_sessions WHERE token_digest=$1",
      [digestSessionToken(issued.token)],
    );
    assert.equal(stored.rows.length, 1);
    assert.notEqual(stored.rows[0].token_digest, issued.token);

    const serverSession = await resolveOwnerSession(pool, issued.token);
    assert.equal(assertVerifiedOwner(serverSession, { ownerId }), ownerId);
    assert.deepEqual(assertOwnedResource(serverSession, { created_by: ownerId, secret: "private" }), { created_by: ownerId, secret: "private" });
    assert.throws(() => assertOwnedResource(serverSession, { created_by: otherId }), OwnerNotAuthorized);
    assert.throws(() => assertVerifiedOwner(serverSession, { ownerId: otherId }), OwnerNotAuthorized);
    assert.equal(await resolveOwnerSession(pool, "malformed"), null);

    assert.equal(await revokeOwnerSession(pool, issued.token), true);
    assert.equal(await revokeOwnerSession(pool, issued.token), false);
    assert.equal(await resolveOwnerSession(pool, issued.token), null);
  });

  await t.test("rotation revokes old session atomically and prevents old-token replay", async () => {
    const issued = await createSessionForVerifiedOwner(pool, { ownerId });
    const rotated = await rotateOwnerSession(pool, issued.token);
    assert.notEqual(rotated.token, issued.token);
    assert.equal(await resolveOwnerSession(pool, issued.token), null);
    assert.ok(await resolveOwnerSession(pool, rotated.token));
    await assert.rejects(rotateOwnerSession(pool, issued.token), OwnerNotAuthorized);
    assert.equal(await revokeOwnerSession(pool, rotated.token), true);
  });

  await t.test("only one concurrent rotation of a token can succeed", async () => {
    const issued = await createSessionForVerifiedOwner(pool, { ownerId });
    const outcomes = await Promise.allSettled([
      rotateOwnerSession(pool, issued.token), rotateOwnerSession(pool, issued.token),
    ]);
    assert.equal(outcomes.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(outcomes.filter((r) => r.status === "rejected" && r.reason instanceof OwnerNotAuthorized).length, 1);
    for (const item of outcomes) if (item.status === "fulfilled") await revokeOwnerSession(pool, item.value.token);
  });

  await t.test("expired sessions and disabled owners are denied", async () => {
    const now = new Date("2026-10-23T00:00:00Z");
    const issued = await createSessionForVerifiedOwner(pool, { ownerId, now, ttlSeconds: 60 });
    assert.equal(await resolveOwnerSession(pool, issued.token, { now: new Date(now.getTime() + 60_000) }), null);
    await assert.rejects(rotateOwnerSession(pool, issued.token, { now: new Date(now.getTime() + 60_001) }), OwnerNotAuthorized);
    const otherIssued = await createSessionForVerifiedOwner(pool, { ownerId });
    await pool.query("UPDATE admin_users SET status='disabled' WHERE id=$1::uuid", [ownerId]);
    assert.equal(await resolveOwnerSession(pool, otherIssued.token), null);
    await assert.rejects(createSessionForVerifiedOwner(pool, { ownerId }), OwnerNotAuthorized);
    await pool.query("UPDATE admin_users SET status='active' WHERE id=$1::uuid", [ownerId]);
    const count = await revokeAllOwnerSessions(pool, ownerId);
    assert.ok(count >= 1);
    assert.equal(await resolveOwnerSession(pool, otherIssued.token), null);
  });
});
