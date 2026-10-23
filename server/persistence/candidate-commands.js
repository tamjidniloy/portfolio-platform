/**
 * PHASE04.1 CANDIDATE / NOT A LIVE CMS.
 * Persistence-level proof of atomicity, NOT an authorized public API.
 * Do not expose these functions from HTTP routes until MFA, SRS and DB/API
 * contracts are formally approved and owner authorization is implemented.
 */
import { withTransaction } from "./unit-of-work.js";
import { toPublicDto, isPublicPath } from "./published-reader.js";

export class VersionConflict extends Error {
  constructor() {
    super("Content was modified; reload before retrying");
    this.name = "VersionConflict";
    this.code = "VERSION_CONFLICT";
  }
}

async function lockItem(client, itemId, expectedVersion) {
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
    throw new TypeError("Expected lock version must be a nonnegative integer");
  }
  const result = await client.query(
    "SELECT id, lock_version, latest_revision_no, publication_state FROM content_items WHERE id = $1::uuid FOR UPDATE",
    [itemId],
  );
  if (result.rows.length === 0) throw new VersionConflict();
  const row = result.rows[0];
  if (Number(row.lock_version) !== expectedVersion) throw new VersionConflict();
  return row;
}

function verifyActor(actorId) {
  if (typeof actorId !== "string" || !/^[0-9a-f-]{36}$/i.test(actorId)) {
    throw new TypeError("Persisted actor UUID required");
  }
}

export async function saveCandidateRevision(pool, { itemId, actorId, expectedVersion, payload, payloadSha256 }) {
  verifyActor(actorId);
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
      typeof payloadSha256 !== "string" || !/^[a-fA-F0-9]{64}$/.test(payloadSha256)) {
    throw new TypeError("Valid revision JSON and SHA-256 are required");
  }
  return withTransaction(pool, async (client) => {
    const item = await lockItem(client, itemId, expectedVersion);
    const revisionNo = item.latest_revision_no + 1;
    await client.query(
      `INSERT INTO content_revisions
         (item_id, revision_no, payload, schema_version, payload_sha256, created_by)
       VALUES ($1::uuid,$2,$3::jsonb,1,$4,$5::uuid)`,
      [itemId, revisionNo, JSON.stringify(payload), payloadSha256, actorId],
    );
    await client.query(
      "UPDATE content_items SET latest_revision_no = $2, lock_version = lock_version + 1, updated_at = now() WHERE id = $1::uuid",
      [itemId, revisionNo],
    );
    await client.query(
      `INSERT INTO audit_events(actor_admin_id, action, target_kind, target_id)
       VALUES ($1::uuid,'content.revision_saved','content',$2::uuid)`,
      [actorId, itemId],
    );
    return Object.freeze({ revisionNo, lockVersion: expectedVersion + 1 });
  });
}

export async function publishCandidateSnapshot(
  pool, { itemId, actorId, expectedVersion, revisionNo, publicPath, publicPayload, dedupeKey },
) {
  verifyActor(actorId);
  if (!Number.isSafeInteger(revisionNo) || revisionNo < 1 || !isPublicPath(publicPath) ||
      !toPublicDto(publicPayload) || typeof dedupeKey !== "string" || dedupeKey.length < 8 || dedupeKey.length > 200) {
    throw new TypeError("Invalid proposed publication inputs");
  }
  return withTransaction(pool, async (client) => {
    await lockItem(client, itemId, expectedVersion);
    const revision = await client.query(
      "SELECT revision_no FROM content_revisions WHERE item_id = $1::uuid AND revision_no = $2",
      [itemId, revisionNo],
    );
    if (revision.rows.length !== 1) throw new VersionConflict();
    const safePublic = toPublicDto(publicPayload);
    await client.query(
      `INSERT INTO published_snapshots
         (item_id,source_revision_no,public_path,public_payload,published_by,generation)
       VALUES ($1::uuid,$2,$3,$4::jsonb,$5::uuid,1)
       ON CONFLICT (item_id) DO UPDATE SET
         source_revision_no = EXCLUDED.source_revision_no,
         public_path = EXCLUDED.public_path,
         public_payload = EXCLUDED.public_payload,
         published_by = EXCLUDED.published_by,
         published_at = now(),
         generation = published_snapshots.generation + 1`,
      [itemId, revisionNo, publicPath, JSON.stringify(safePublic), actorId],
    );
    await client.query(
      "UPDATE content_items SET publication_state='published', lock_version=lock_version+1, updated_at=now() WHERE id=$1::uuid",
      [itemId],
    );
    await client.query(
      `INSERT INTO audit_events(actor_admin_id, action, target_kind, target_id)
       VALUES($1::uuid,'content.published','content',$2::uuid)`,
      [actorId, itemId],
    );
    await client.query(
      `INSERT INTO outbox_events(event_type, aggregate_id, dedupe_key, safe_payload)
       VALUES ('content.published',$1::uuid,$2,'{}'::jsonb)`,
      [itemId, dedupeKey],
    );
    return Object.freeze({ publicPath, lockVersion: expectedVersion + 1 });
  });
}

export async function unpublishCandidateSnapshot(pool, { itemId, actorId, expectedVersion, dedupeKey }) {
  verifyActor(actorId);
  if (typeof dedupeKey !== "string" || dedupeKey.length < 8 || dedupeKey.length > 200) {
    throw new TypeError("Invalid deduplication key");
  }
  return withTransaction(pool, async (client) => {
    await lockItem(client, itemId, expectedVersion);
    await client.query("DELETE FROM published_snapshots WHERE item_id = $1::uuid", [itemId]);
    await client.query(
      "UPDATE content_items SET publication_state='archived', lock_version=lock_version+1, updated_at=now() WHERE id=$1::uuid",
      [itemId],
    );
    await client.query(
      `INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id)
       VALUES ($1::uuid,'content.unpublished','content',$2::uuid)`,
      [actorId, itemId],
    );
    await client.query(
      `INSERT INTO outbox_events(event_type,aggregate_id,dedupe_key,safe_payload)
       VALUES ('content.unpublished',$1::uuid,$2,'{}'::jsonb)`,
      [itemId, dedupeKey],
    );
    return Object.freeze({ visible: false, lockVersion: expectedVersion + 1 });
  });
}
