/**
 * ISOLATED CI CANDIDATE-SCHEMA VALIDATION ONLY.
 * Never run against a normal developer DB. No contract has been approved.
 */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";
import { assertCandidateDatabase } from "../../server/persistence/candidate-only.js";
import { saveCandidateRevision, publishCandidateSnapshot, unpublishCandidateSnapshot, VersionConflict } from "../../server/persistence/candidate-commands.js";
import { readPublishedByPath, listPublished } from "../../server/persistence/published-reader.js";

function digest(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

test("Phase03 18-table candidate DDL and 04.1 transaction invariants in ephemeral DB only", async (t) => {
  const uri = process.env.CANDIDATE_DATABASE_URL;
  assertCandidateDatabase(uri, process.env.NODE_ENV);
  const pool = new pg.Pool({ connectionString: uri, max: 5, connectionTimeoutMillis: 1500 });
  t.after(async () => pool.end());

  await t.test("proposed DDL applies only to isolated candidate database", async () => {
    const ddl = await readFile(
      "docs/phase03/03_DATABASE_ARCHITECTURE/schema/01_CANDIDATE_POSTGRES_DDL.sql",
      "utf8",
    );
    assert.match(ddl, /DO NOT APPLY TO PRODUCTION/);
    await pool.query(ddl);
    const r = await pool.query(
      "SELECT count(*)::int AS total FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%'",
    );
    assert.equal(r.rows[0].total, 18);
  });

  const user = await pool.query(
    "INSERT INTO admin_users(email,password_hash) VALUES($1,$2) RETURNING id",
    ["fixture@invalid.test", "NOT_AN_ACTUAL_PASSWORD_HASH_FIXTURE"],
  );
  const actorId = user.rows[0].id;

  const create = async () => {
    const res = await pool.query(
      "INSERT INTO content_items(content_type, created_by, current_slug) VALUES ('project',$1::uuid,$2) RETURNING id",
      [actorId, randomUUID()],
    );
    return res.rows[0].id;
  };

  await t.test("a draft remains invisible and revision fields stay private", async () => {
    const itemId = await create();
    const privatePayload = { title: "Private only", notes: "SECRET_NOT_PUBLIC", slug: "private-only" };
    const rev = await saveCandidateRevision(pool, {
      itemId, actorId, expectedVersion: 0, payload: privatePayload, payloadSha256: digest(privatePayload),
    });
    assert.deepEqual(rev, { revisionNo: 1, lockVersion: 1 });
    assert.equal(await readPublishedByPath(pool, "/projects/private-only"), null);
    const stored = await pool.query("SELECT payload FROM content_revisions WHERE item_id=$1::uuid", [itemId]);
    assert.equal(stored.rows[0].payload.notes, "SECRET_NOT_PUBLIC");
    await assert.rejects(saveCandidateRevision(pool, {
      itemId, actorId, expectedVersion: 1, payload: privatePayload, payloadSha256: "a".repeat(64),
    }), /SHA-256 does not match/);
    await assert.rejects(unpublishCandidateSnapshot(pool, {
      itemId, actorId, expectedVersion: 1, dedupeKey: randomUUID(),
    }), VersionConflict, "cannot unpublish a never-published draft");
  });

  await t.test("publishing is atomic with revision FK, safe DTO, audit and outbox", async () => {
    const itemId = await create();
    const draft = { slug: "verified-project", title: "Verified project", summary: "Reviewed", privateNotes: "DONOTLEAK" };
    await saveCandidateRevision(pool, { itemId, actorId, expectedVersion: 0, payload: draft, payloadSha256: digest(draft) });
    await assert.rejects(publishCandidateSnapshot(pool, {
      itemId, actorId, expectedVersion: 1, revisionNo: 1, publicPath: "/projects/verified-project",
      publicPayload: { ...draft, title: "Forged public title" }, dedupeKey: randomUUID(),
    }), /must match the exact approved revision/);
    const publish = await publishCandidateSnapshot(pool, {
      itemId, actorId, expectedVersion: 1, revisionNo: 1, publicPath: "/projects/verified-project",
      publicPayload: draft, dedupeKey: randomUUID(),
    });
    assert.deepEqual(publish, { publicPath: "/projects/verified-project", lockVersion: 2 });
    const publicDto = await readPublishedByPath(pool, "/projects/verified-project");
    assert.deepEqual(publicDto, { slug: draft.slug, title: draft.title, summary: draft.summary });
    assert.equal(JSON.stringify(publicDto).includes("DONOTLEAK"), false);
    const records = await pool.query(
      "SELECT (SELECT COUNT(*)::int FROM outbox_events WHERE aggregate_id=$1::uuid) AS outbox, (SELECT COUNT(*)::int FROM audit_events WHERE target_id=$1::uuid) AS audits",
      [itemId],
    );
    assert.equal(records.rows[0].outbox, 1);
    const state = await pool.query("SELECT lock_version FROM content_items WHERE id=$1::uuid", [itemId]);
    assert.equal(Number(state.rows[0].lock_version), 2, "failed forged publish must leave state unchanged");
    assert.equal(records.rows[0].audits, 2);

    const secondDraft = { ...draft, title: "Unpublished later edit", privateNotes: "NEW_PRIVATE" };
    await saveCandidateRevision(pool, { itemId, actorId, expectedVersion: 2, payload: secondDraft, payloadSha256: digest(secondDraft) });
    assert.deepEqual(await readPublishedByPath(pool, "/projects/verified-project"), {
      slug: draft.slug, title: draft.title, summary: draft.summary,
    }, "editing published content must not implicitly republish a private revision");

    await assert.rejects(publishCandidateSnapshot(pool, {
      itemId, actorId, expectedVersion: 2, revisionNo: 2, publicPath: "/projects/verified-project",
      publicPayload: secondDraft, dedupeKey: randomUUID(),
    }), VersionConflict, "stale revisions must conflict");

    const beforeCount = await pool.query("SELECT COUNT(*)::int AS c FROM outbox_events WHERE aggregate_id=$1::uuid", [itemId]);
    const stale = await pool.query("SELECT lock_version FROM content_items WHERE id=$1::uuid", [itemId]);
    assert.equal(Number(stale.rows[0].lock_version), 3);
    assert.equal(beforeCount.rows[0].c, 1);

    await unpublishCandidateSnapshot(pool, { itemId, actorId, expectedVersion: 3, dedupeKey: randomUUID() });
    assert.equal(await readPublishedByPath(pool, "/projects/verified-project"), null);
    assert.equal((await listPublished(pool, { limit: 30 })).some((x) => x.slug === "verified-project"), false);
    const unpublished = await pool.query("SELECT publication_state,lock_version FROM content_items WHERE id=$1::uuid", [itemId]);
    assert.equal(unpublished.rows[0].publication_state, "archived");
    assert.equal(Number(unpublished.rows[0].lock_version), 4);
  });

  await t.test("duplicate public path rolls back state and outbox", async () => {
    const itemA = await create();
    const itemB = await create();
    const content = { slug: "collision", title: "Collision", summary: "Safe" };
    for (const itemId of [itemA, itemB]) {
      await saveCandidateRevision(pool, { itemId, actorId, expectedVersion: 0, payload: content, payloadSha256: digest(content) });
    }
    await publishCandidateSnapshot(pool, {
      itemId: itemA, actorId, expectedVersion: 1, revisionNo: 1, publicPath: "/projects/collision",
      publicPayload: content, dedupeKey: randomUUID(),
    });
    await assert.rejects(publishCandidateSnapshot(pool, {
      itemId: itemB, actorId, expectedVersion: 1, revisionNo: 1, publicPath: "/projects/collision",
      publicPayload: content, dedupeKey: randomUUID(),
    }), (error) => error.code === "23505");
    const second = await pool.query("SELECT publication_state,lock_version FROM content_items WHERE id=$1::uuid", [itemB]);
    assert.equal(second.rows[0].publication_state, "draft");
    assert.equal(Number(second.rows[0].lock_version), 1);
    const emitted = await pool.query("SELECT COUNT(*)::int AS c FROM outbox_events WHERE aggregate_id=$1::uuid", [itemB]);
    assert.equal(emitted.rows[0].c, 0);
  });

  await t.test("two concurrent edits with same lock version produce one winner", async () => {
    const itemId = await create();
    const make = (which) => {
      const payload = { title: which };
      return saveCandidateRevision(pool, { itemId, actorId, expectedVersion: 0, payload, payloadSha256: digest(payload) });
    };
    const results = await Promise.allSettled([make("A"), make("B")]);
    assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
    assert.equal(results.filter((x) => x.status === "rejected" && x.reason instanceof VersionConflict).length, 1);
    const after = await pool.query("SELECT COUNT(*)::int AS c FROM content_revisions WHERE item_id=$1::uuid", [itemId]);
    assert.equal(after.rows[0].c, 1);
  });

  await t.test("constraints reject invalid source revisions and impossible data", async () => {
    const itemId = await create();
    await assert.rejects(pool.query(
      "INSERT INTO published_snapshots(item_id,source_revision_no,public_path,public_payload,published_by) VALUES($1::uuid,999,'/projects/no-source','{}'::jsonb,$2::uuid)",
      [itemId, actorId],
    ), (error) => error.code === "23503");
  });
});
