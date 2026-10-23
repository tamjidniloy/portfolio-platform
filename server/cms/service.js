import { createHash } from "node:crypto";
import { withTransaction } from "../persistence/unit-of-work.js";
import { assertVerifiedOwner } from "../identity/session-store.js";
import {
  CmsError, assertContentType, badInput, checkedUuid, checkedVersion,
  checkedRevision, checkedKey, validateDraft, projectPublicRevision,
} from "../../domain/cms/content-contract.js";

const sha = text => createHash("sha256").update(text, "utf8").digest("hex");
const VERSION = 1;
function owner(session) { return assertVerifiedOwner(session); }
function conflict() { throw new CmsError("REVISION_CONFLICT", 412, "Content changed; reload before saving"); }
function absent() { throw new CmsError("NOT_FOUND", 404, "Content not found"); }
function checkedNote(note) {
  if (note !== undefined && (typeof note !== "string" || note.length > 1000)) throw badInput("Invalid change note");
  return note ?? null;
}
function canonicalJson(value, depth=0) {
  if (depth > 50) throw badInput("JSON nesting too deep");
  if (Array.isArray(value)) return value.map(v=>canonicalJson(v,depth+1));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonicalJson(value[k],depth+1)]));
  }
  return value;
}
function revisionJson(payload) {
  const json = JSON.stringify(canonicalJson(payload));
  return {json,digest:sha(json)};
}
function normalizeItem(row) {
  return {
    id: row.id, contentType: row.content_type,
    publicationState: row.publication_state,
    lockVersion: Number(row.lock_version),
    latestRevisionNo: row.latest_revision_no,
    updatedAt: row.updated_at,
    payload: row.payload || null,
  };
}
async function lockedItem(client, id, actor, version) {
  checkedUuid(id);
  checkedVersion(version);
  const r = await client.query(
    "SELECT id,content_type,lock_version,latest_revision_no,publication_state,current_slug,created_by FROM content_items WHERE id=$1::uuid AND created_by=$2::uuid FOR UPDATE",
    [id,actor],
  );
  if (!r.rows.length) absent();
  if (BigInt(r.rows[0].lock_version) !== BigInt(version)) conflict();
  return r.rows[0];
}
async function revisionFor(client,id,revisionNo) {
  checkedRevision(revisionNo);
  const r=await client.query(
    "SELECT payload,revision_no,payload_sha256 FROM content_revisions WHERE item_id=$1::uuid AND revision_no=$2",
    [id,revisionNo],
  );
  if (r.rows.length!==1) absent();
  if (revisionJson(r.rows[0].payload).digest !== r.rows[0].payload_sha256) {
    throw new CmsError("REVISION_INTEGRITY",409,"Stored revision integrity check failed");
  }
  return r.rows[0];
}
async function audit(client, actorId, targetId, action) {
  await client.query(
    "INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id,redacted_metadata) VALUES($1::uuid,$2,'content',$3::uuid,'{}'::jsonb)",
    [actorId,action,targetId],
  );
}
async function writeOutbox(client,itemId,eventType,key,publicPath) {
  await client.query(
    "INSERT INTO outbox_events(event_type,aggregate_id,dedupe_key,safe_payload) VALUES($1,$2::uuid,$3,$4::jsonb)",
    [eventType,itemId,sha(eventType+"\0"+key)],
  );
}
async function idempotent(client, scope, key, request, fn) {
  checkedKey(key);
  const digest = sha(JSON.stringify(request));
  // The unique index serializes concurrent calls with the same scope/key.
  const keyDigest = sha(key);
  await client.query(
    `INSERT INTO idempotency_keys(scope,key_digest,request_digest,status,expires_at)
     VALUES ($1,$2,$3,'pending',now()+interval '24 hours')
     ON CONFLICT (scope,key_digest) DO NOTHING`,
    [scope,keyDigest,digest],
  );
  const r = await client.query(
    "SELECT request_digest,status,safe_result FROM idempotency_keys WHERE scope=$1 AND key_digest=$2 FOR UPDATE",
    [scope,keyDigest],
  );
  if (!r.rows.length) throw new Error("Idempotency receipt disappeared");
  if (r.rows[0].request_digest !== digest) throw new CmsError("IDEMPOTENCY_CONFLICT",409,"Key already used for another request");
  if (r.rows[0].status === "complete") return r.rows[0].safe_result;
  const result = await fn();
  await client.query(
    "UPDATE idempotency_keys SET status='complete',safe_result=$3::jsonb WHERE scope=$1 AND key_digest=$2",
    [scope,keyDigest,JSON.stringify(result)],
  );
  return result;
}

async function linkRevisionMedia(client,{id,revisionNo,actor,payload}){
  const ids=payload.mediaIds||[];
  if(!ids.length)return;
  const result=await client.query(
    "SELECT id FROM media_assets WHERE id=ANY($1::uuid[]) AND created_by=$2::uuid AND state='ready'",
    [ids,actor],
  );
  if(result.rows.length!==ids.length)throw new CmsError("MEDIA_NOT_READY",422,"Attachment is not approved and ready");
  for(const mediaId of ids){
    await client.query(
      `INSERT INTO media_references(item_id,revision_no,media_id,use_role)
       VALUES($1::uuid,$2,$3::uuid,'attachment')`,[id,revisionNo,mediaId],
    );
  }
}

export async function createDraft(pool, session, { type, payload, key } = {}) {
  const actor=owner(session);
  assertContentType(type);
  const clean=validateDraft(type,payload);
  const {json,digest}=revisionJson(clean);
  return withTransaction(pool,client=>idempotent(
    client,"cms.create:"+actor,key,{type,clean},async()=>{
      const r=await client.query(
        "INSERT INTO content_items(content_type,created_by,latest_revision_no,lock_version) VALUES($1,$2::uuid,1,1) RETURNING id",
        [type,actor],
      );
      const id=r.rows[0].id;
      await client.query(
        `INSERT INTO content_revisions(item_id,revision_no,payload,schema_version,payload_sha256,created_by)
         VALUES ($1::uuid,1,$2::jsonb,$3,$4,$5::uuid)`,
        [id,json,VERSION,digest,actor],
      );
      await linkRevisionMedia(client,{id,revisionNo:1,actor,payload:clean});
      await audit(client,actor,id,"content.created");
      return {id,revisionNo:1,lockVersion:1,status:"saved"};
    }
  ));
}
export async function saveDraft(pool, session, {id,expectedVersion,payload,changeNote} = {}) {
  const actor=owner(session);
  checkedUuid(id);
  checkedNote(changeNote);
  return withTransaction(pool,async client=>{
    const item=await lockedItem(client,id,actor,expectedVersion);
    const clean=validateDraft(item.content_type,payload);
    const {json,digest}=revisionJson(clean), next=item.latest_revision_no+1;
    await client.query(
      `INSERT INTO content_revisions(item_id,revision_no,payload,schema_version,payload_sha256,created_by,change_note)
       VALUES($1::uuid,$2,$3::jsonb,$4,$5,$6::uuid,$7)`,
      [id,next,json,VERSION,digest,actor,changeNote||null],
    );
    await client.query(
      "UPDATE content_items SET latest_revision_no=$2,lock_version=lock_version+1,updated_at=now() WHERE id=$1::uuid",
      [id,next],
    );
    await linkRevisionMedia(client,{id,revisionNo:next,actor,payload:clean});
    await audit(client,actor,id,"content.revision_saved");
    return {id,revisionNo:next,lockVersion:expectedVersion+1,status:"saved"};
  });
}
export async function listDrafts(pool, session, {limit=20,offset=0}={}) {
  const actor=owner(session);
  if (!Number.isInteger(limit)||limit<1||limit>50||!Number.isInteger(offset)||offset<0||offset>10000) throw badInput("Invalid pagination");
  const r=await pool.query(
    `SELECT i.*,r.payload FROM content_items i
     LEFT JOIN content_revisions r ON r.item_id=i.id AND r.revision_no=i.latest_revision_no
     WHERE i.created_by=$1::uuid ORDER BY i.updated_at DESC,i.id LIMIT $2 OFFSET $3`,
    [actor,limit,offset],
  );
  return r.rows.map(normalizeItem);
}
export async function getDraft(pool, session, id) {
  const actor=owner(session);
  checkedUuid(id);
  const r=await pool.query(
    `SELECT i.*,r.payload FROM content_items i
     LEFT JOIN content_revisions r ON r.item_id=i.id AND r.revision_no=i.latest_revision_no
     WHERE i.id=$1::uuid AND i.created_by=$2::uuid`,
    [id,actor],
  );
  if (!r.rows.length) absent();
  return normalizeItem(r.rows[0]);
}
export async function listRevisions(pool, session, id, {limit=20}={}) {
  const actor=owner(session);
  checkedUuid(id);
  if (!Number.isInteger(limit)||limit<1||limit>50) throw badInput("Invalid revision pagination");
  const allowed=await pool.query("SELECT 1 FROM content_items WHERE id=$1::uuid AND created_by=$2::uuid",[id,actor]);
  if (!allowed.rows.length) absent();
  const r=await pool.query(
    "SELECT revision_no,created_at,change_note FROM content_revisions WHERE item_id=$1::uuid ORDER BY revision_no DESC LIMIT $2",
    [id,limit],
  );
  return r.rows.map(x=>({revisionNo:x.revision_no,createdAt:x.created_at,changeNote:x.change_note}));
}
export async function previewRevision(pool, session, id, revisionNo) {
  const actor=owner(session);
  checkedUuid(id);
  checkedRevision(revisionNo);
  const r=await pool.query(
    `SELECT i.content_type,r.payload FROM content_items i
     JOIN content_revisions r ON r.item_id=i.id
     WHERE i.id=$1::uuid AND i.created_by=$2::uuid AND r.revision_no=$3`,
    [id,actor,revisionNo],
  );
  if (!r.rows.length) absent();
  // Private preview is data only; presentation must escape all dynamic text.
  return { contentType:r.rows[0].content_type,payload:r.rows[0].payload,noindex:true };
}
export async function restoreRevision(pool, session, {id,revisionNo,expectedVersion,key}={}) {
  const actor=owner(session);
  checkedUuid(id);checkedRevision(revisionNo);checkedVersion(expectedVersion);
  return withTransaction(pool,client=>idempotent(
    client,"cms.restore:"+actor+":"+id,key,{id,revisionNo,expectedVersion},async()=>{
      const item=await lockedItem(client,id,actor,expectedVersion);
      const previous=await revisionFor(client,id,revisionNo);
      const payload=validateDraft(item.content_type,previous.payload);
      const {json,digest}=revisionJson(payload);
      const next=item.latest_revision_no+1;
      await client.query(
        `INSERT INTO content_revisions(item_id,revision_no,payload,schema_version,payload_sha256,created_by,change_note)
         VALUES($1::uuid,$2,$3::jsonb,1,$4,$5::uuid,'Restored from prior revision')`,
        [id,next,json,digest,actor],
      );
      await client.query(
        "UPDATE content_items SET latest_revision_no=$2,lock_version=lock_version+1,updated_at=now() WHERE id=$1::uuid",
        [id,next],
      );
      await linkRevisionMedia(client,{id,revisionNo:next,actor,payload});
      await audit(client,actor,id,"content.restored_to_draft");
      return {id,revisionNo:next,lockVersion:expectedVersion+1,status:"saved"};
    }
  ));
}
export async function publishRevision(pool, session, {id,revisionNo,expectedVersion,key}={}) {
  const actor=owner(session);
  checkedUuid(id);checkedRevision(revisionNo);checkedVersion(expectedVersion);
  return withTransaction(pool,client=>idempotent(
    client,"cms.publish:"+actor+":"+id,key,{id,revisionNo,expectedVersion},async()=>{
      const item=await lockedItem(client,id,actor,expectedVersion);
      const revision=await revisionFor(client,id,revisionNo);
      // Verify published data is immutable revision data, not untrusted client DTO.
      const {publicPath,publicPayload}=projectPublicRevision(item.content_type,revision.payload);
      const media=await client.query(
        `SELECT count(*)::int AS total,
         count(*) FILTER(WHERE m.state='ready')::int AS ready
         FROM media_references r JOIN media_assets m ON m.id=r.media_id
         WHERE r.item_id=$1::uuid AND r.revision_no=$2`,[id,revisionNo],
      );
      if(media.rows[0].total!==media.rows[0].ready)throw new CmsError("MEDIA_NOT_READY",422,"Linked media is not ready");
      const prior=await client.query(
        "SELECT public_path FROM published_snapshots WHERE item_id=$1::uuid FOR UPDATE",
        [id],
      );
      const oldPath=prior.rows[0]?.public_path;
      if (oldPath&&oldPath!==publicPath) {
        await client.query(
          `INSERT INTO slug_redirects(from_path,to_path,http_status,is_active)
           VALUES($1,$2,308,true)
           ON CONFLICT(from_path) DO UPDATE SET to_path=excluded.to_path,is_active=true`,
          [oldPath,publicPath],
        );
        // Collapse older redirect chains to the latest canonical page.
        await client.query(
          "UPDATE slug_redirects SET to_path=$2 WHERE to_path=$1 AND from_path<>$2",
          [oldPath,publicPath],
        );
      }
      await client.query(
        `INSERT INTO published_snapshots(item_id,source_revision_no,public_path,public_payload,published_by,generation)
         VALUES($1::uuid,$2,$3,$4::jsonb,$5::uuid,1)
         ON CONFLICT(item_id) DO UPDATE SET
           source_revision_no=excluded.source_revision_no,public_path=excluded.public_path,
           public_payload=excluded.public_payload,published_by=excluded.published_by,
           generation=published_snapshots.generation+1,published_at=now()
         RETURNING generation`,
        [id,revisionNo,publicPath,JSON.stringify(publicPayload),actor],
      );
      // A formerly redirected path becoming canonical must not redirect.
      await client.query("UPDATE slug_redirects SET is_active=false WHERE from_path=$1",[publicPath]);
      await client.query(
        "UPDATE content_items SET publication_state='published',current_slug=$2,lock_version=lock_version+1,updated_at=now() WHERE id=$1::uuid",
        [id,publicPayload.slug],
      );
      await audit(client,actor,id,"content.published");
      await writeOutbox(client,id,"content.published",key,publicPath);
      const g=await client.query("SELECT generation FROM published_snapshots WHERE item_id=$1::uuid",[id]);
      return {status:"published",revisionNo,lockVersion:expectedVersion+1,generation:Number(g.rows[0].generation),publicPath};
    }
  ));
}
export async function unpublishRevision(pool, session, {id,expectedVersion,key}={}) {
  const actor=owner(session);
  checkedUuid(id);checkedVersion(expectedVersion);
  return withTransaction(pool,client=>idempotent(
    client,"cms.unpublish:"+actor+":"+id,key,{id,expectedVersion},async()=>{
      const item=await lockedItem(client,id,actor,expectedVersion);
      if(item.publication_state!=="published")throw new CmsError("NOT_PUBLISHED",409,"Content is not currently published");
      const prior=await client.query(
        "DELETE FROM published_snapshots WHERE item_id=$1::uuid RETURNING public_path,source_revision_no,generation",
        [id],
      );
      if(!prior.rows.length)throw new Error("Published state is inconsistent with public snapshot");
      await client.query(
        "UPDATE content_items SET publication_state='archived',lock_version=lock_version+1,updated_at=now() WHERE id=$1::uuid",
        [id],
      );
      // Redirects must never reveal unpublished destination.
      await client.query("UPDATE slug_redirects SET is_active=false WHERE to_path=$1",[prior.rows[0].public_path]);
      await audit(client,actor,id,"content.unpublished");
      await writeOutbox(client,id,"content.unpublished",key,prior.rows[0].public_path);
      return {status:"unpublished",revisionNo:prior.rows[0].source_revision_no,lockVersion:expectedVersion+1,generation:Number(prior.rows[0].generation),publicPath:prior.rows[0].public_path};
    }
  ));
}
