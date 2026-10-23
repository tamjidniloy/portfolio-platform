import { randomBytes, randomUUID, createHash } from "node:crypto";
import { withTransaction } from "../persistence/unit-of-work.js";
import { assertVerifiedOwner } from "../identity/session-store.js";
import { CmsError, checkedUuid } from "../../domain/cms/content-contract.js";
import { validateMediaIntent } from "./media-validation.js";

const hash=str=>createHash("sha256").update(str).digest("hex");
const err=(code,status,message)=>new CmsError(code,status,message);
export async function createMediaIntent(pool,session,storage,input){
  const owner=assertVerifiedOwner(session);
  const {name,mime,size,sha256}=validateMediaIntent(input);
  if(!storage?.createUpload)throw Error("Private storage is not configured");
  const id=randomUUID(),key="private/staging/"+id+"/"+randomBytes(20).toString("hex");
  // Provision a signed, short-lived POST before recording staging metadata.
  // Failure here never creates a misleading DB asset.
  const upload=await storage.createUpload({key,mime,size});
  await pool.query(
    `INSERT INTO media_assets
     (id,storage_key,original_name,declared_mime,byte_size,sha256_hex,state,created_by)
     VALUES($1::uuid,$2,$3,$4,$5,$6,'staging',$7::uuid)`,
    [id,key,name,mime,size,sha256,owner],
  );
  return {id,state:"staging",upload};
}
export async function listMedia(pool,session,{limit=20}={}){
  const owner=assertVerifiedOwner(session);
  if(!Number.isInteger(limit)||limit<1||limit>50)throw err("INVALID_LIMIT",422,"Invalid pagination");
  const r=await pool.query(
    `SELECT id,original_name,declared_mime,observed_mime,byte_size,
     sha256_hex,state,created_at FROM media_assets
     WHERE created_by=$1::uuid ORDER BY created_at DESC LIMIT $2`,[owner,limit],
  );
  return {items:r.rows.map(x=>({
    id:x.id,name:x.original_name,mime:x.observed_mime||x.declared_mime,
    size:Number(x.byte_size),sha256:x.sha256_hex,state:x.state,createdAt:x.created_at,
  }))};
}
export async function finalizeMedia(pool,session,storage,id){
  const owner=assertVerifiedOwner(session);
  checkedUuid(id);
  const initial=await pool.query(
    "SELECT * FROM media_assets WHERE id=$1::uuid AND created_by=$2::uuid",
    [id,owner],
  );
  if(!initial.rows.length)throw err("MEDIA_NOT_FOUND",404,"Media not found");
  const asset=initial.rows[0];
  if(asset.state==="ready")return {id,state:"ready",mime:asset.observed_mime};
  if(asset.state!=="staging")throw err("INVALID_MEDIA_STATE",409,"Media cannot be finalized");
  if(!storage?.inspect)throw Error("Private media verification unavailable");
  let verified;
  try{
    verified=await storage.inspect({
      key:asset.storage_key,mime:asset.declared_mime,
      size:Number(asset.byte_size),sha256:asset.sha256_hex,
    });
  }catch{
    // Do not trust or retain rejected byte content. Physical deletion is retried after commit.
    await withTransaction(pool,async client=>{
      const row=await client.query(
        "SELECT state FROM media_assets WHERE id=$1::uuid AND created_by=$2::uuid FOR UPDATE",
        [id,owner],
      );
      if(row.rows[0]?.state!=="staging")return;
      await client.query("UPDATE media_assets SET state='rejected' WHERE id=$1::uuid",[id]);
      await client.query(
        `INSERT INTO outbox_events(event_type,aggregate_id,dedupe_key,safe_payload)
         VALUES('media.delete',$1::uuid,$2,'{}'::jsonb) ON CONFLICT(dedupe_key) DO NOTHING`,
        [id,hash("media.delete:"+id)],
      );
    });
    throw err("INVALID_MEDIA",422,"Media object failed verification");
  }
  return withTransaction(pool,async client=>{
    const locked=await client.query(
      "SELECT * FROM media_assets WHERE id=$1::uuid AND created_by=$2::uuid FOR UPDATE",
      [id,owner],
    );
    if(!locked.rows.length)throw err("MEDIA_NOT_FOUND",404,"Media not found");
    if(locked.rows[0].state==="ready")return {id,state:"ready",mime:locked.rows[0].observed_mime};
    if(locked.rows[0].state!=="staging")throw err("INVALID_MEDIA_STATE",409,"Media state changed");
    await client.query(
      "UPDATE media_assets SET state='ready',observed_mime=$2,sha256_hex=$3 WHERE id=$1::uuid",
      [id,verified.observedMime,verified.sha256],
    );
    await client.query(
      `INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id)
       VALUES($1::uuid,'media.finalized','media',$2::uuid)`,[owner,id],
    );
    return {id,state:"ready",mime:verified.observedMime,size:verified.byteSize};
  });
}
export async function retireMedia(pool,session,id){
  const owner=assertVerifiedOwner(session);
  checkedUuid(id);
  return withTransaction(pool,async client=>{
    const r=await client.query(
      "SELECT state FROM media_assets WHERE id=$1::uuid AND created_by=$2::uuid FOR UPDATE",
      [id,owner],
    );
    if(!r.rows.length)throw err("MEDIA_NOT_FOUND",404,"Media not found");
    const ref=await client.query("SELECT 1 FROM media_references WHERE media_id=$1::uuid LIMIT 1",[id]);
    if(ref.rowCount)throw err("MEDIA_IN_USE",409,"A content revision still references this asset");
    if(r.rows[0].state==="retired")return {id,state:"retired"};
    await client.query("UPDATE media_assets SET state='retired' WHERE id=$1::uuid",[id]);
    await client.query(
      `INSERT INTO outbox_events(event_type,aggregate_id,dedupe_key,safe_payload)
       VALUES('media.delete',$1::uuid,$2,'{}'::jsonb) ON CONFLICT(dedupe_key) DO NOTHING`,
      [id,hash("media.delete:"+id)],
    );
    await client.query(
      `INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id)
       VALUES($1::uuid,'media.retired','media',$2::uuid)`,[owner,id],
    );
    return {id,state:"retired"};
  });
}
