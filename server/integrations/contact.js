import express from "express";
import { createHash, timingSafeEqual } from "node:crypto";
import { withTransaction } from "../persistence/unit-of-work.js";
import { CmsError, checkedUuid } from "../../domain/cms/content-contract.js";
import { assertVerifiedOwner } from "../identity/session-store.js";

const fail=(code,status,message)=>new CmsError(code,status,message);
const safeEmail=value=>typeof value==="string"&&value.length<=254&&
  /^[^\s@\x00-\x1f]+@[^\s@\x00-\x1f]+\.[^\s@\x00-\x1f]+$/.test(value);
export function validateContactRequest(value,noticeVersion){
  if(!value||typeof value!=="object"||Array.isArray(value))throw fail("INVALID_CONTACT",422,"Invalid message");
  const {name,email,message,consent,notice,website}=value;
  if(typeof website!=="string"&&website!==undefined)throw fail("INVALID_CONTACT",422,"Invalid request");
  if(website?.trim())throw fail("INVALID_CONTACT",422,"Invalid request");
  if(typeof name!=="string"||name.trim().length<1||name.length>120||
     typeof message!=="string"||message.trim().length<1||message.length>5000||
     !safeEmail(email)||!consent||consent!==true||notice!==noticeVersion){
    throw fail("INVALID_CONTACT",422,"Name, valid email, message and explicit current consent required");
  }
  return {name:name.trim(),email:email.toLowerCase(),message:message.trim(),notice};
}
const sha=x=>createHash("sha256").update(x).digest("hex");
/** Salted rotating/privately configured digest; raw IP never enters SQL. */
export function digestClientIp(address,pepper){
  if(typeof address!=="string"||address.length>130||typeof pepper!=="string"||
      Buffer.byteLength(pepper,"utf8")<32)throw Error("IP privacy/abuse config required");
  return sha("devfolio-contact-v1\0"+pepper+"\0"+address);
}
export async function receiveContact(pool,{payload,ipDigest,noticeVersion}={}){
  const data=validateContactRequest(payload,noticeVersion);
  if(!/^[a-f0-9]{64}$/.test(ipDigest))throw fail("INVALID_CONTACT",422,"Unable to verify request");
  return withTransaction(pool,async client=>{
    // Serializes concurrent writes per hashed IP without persisting raw IP.
    const lock=BigInt("0x"+ipDigest.slice(0,15)).toString();
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)",[lock]);
    const enabled=await client.query(
      "SELECT private_config->>'contactEnabled' AS enabled FROM site_private_config WHERE singleton_id=1",
    );
    if(enabled.rows[0]?.enabled!=="true")throw fail("CONTACT_DISABLED",503,"Contact form unavailable");
    const counts=await client.query(
      `SELECT
       count(*) FILTER(WHERE created_at>now()-interval '15 minutes')::int AS quarter,
       count(*)::int AS day
       FROM contact_messages WHERE request_ip_digest=$1 AND created_at>now()-interval '24 hours'`,
      [ipDigest],
    );
    if(counts.rows[0].quarter>=3||counts.rows[0].day>=10)
      throw fail("CONTACT_RATE_LIMIT",429,"Too many messages; try again later");
    const stored=await client.query(
      `INSERT INTO contact_messages
       (sender_name,sender_email,message_body,consent_at,notice_version,
        retention_until,request_ip_digest,message_sha256)
       VALUES($1,$2,$3,now(),$4,now()+interval '90 days',$5,$6)
       RETURNING id`,
      [data.name,data.email,data.message,data.notice,ipDigest,sha(data.message)],
    );
    const id=stored.rows[0].id;
    await client.query(
      `INSERT INTO outbox_events(event_type,aggregate_id,dedupe_key,safe_payload)
       VALUES('contact.notify',$1::uuid,$2,'{}'::jsonb)`,
      [id,sha("contact.notify:"+id)],
    );
    return {received:true,notification:"queued",receiptId:id};
  });
}
export async function listMessages(pool,session,{limit=20}={}){
  assertVerifiedOwner(session);
  if(!Number.isInteger(limit)||limit<1||limit>50)throw fail("INVALID_LIMIT",422,"Invalid limit");
  const r=await pool.query(
    `SELECT id,sender_name,sender_email,message_body,created_at,consent_at,
      notice_version,status,retention_until FROM contact_messages
      WHERE deleted_at IS NULL AND status<>'deleted'
      ORDER BY created_at DESC LIMIT $1`,[limit],
  );
  return {items:r.rows.map(row=>({
    id:row.id,name:row.sender_name,email:row.sender_email,
    message:row.message_body,status:row.status,createdAt:row.created_at,
    consentAt:row.consent_at,notice:row.notice_version,
    retentionUntil:row.retention_until,
  }))};
}
export async function deleteMessage(pool,session,id){
  const owner=assertVerifiedOwner(session);
  checkedUuid(id);
  return withTransaction(pool,async client=>{
    const found=await client.query(
      `SELECT id,legal_hold_until FROM contact_messages
       WHERE id=$1::uuid AND deleted_at IS NULL FOR UPDATE`,[id],
    );
    if(!found.rows.length)throw fail("NOT_FOUND",404,"Message not found");
    if(found.rows[0].legal_hold_until && new Date(found.rows[0].legal_hold_until)>new Date())
      throw fail("LEGAL_HOLD",409,"This message is subject to an active legal hold");
    await client.query(
      `UPDATE contact_messages SET sender_name='[deleted]',sender_email='deleted@invalid.example',
       message_body='[deleted]',message_sha256=NULL,request_ip_digest=NULL,
       status='deleted',deleted_at=now() WHERE id=$1::uuid`,[id],
    );
    await client.query(
      `UPDATE outbox_events SET processed_at=now(),claimed_until=NULL
       WHERE aggregate_id=$1::uuid AND event_type='contact.notify' AND processed_at IS NULL`,[id],
    );
    await client.query(
      `INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id)
       VALUES($1::uuid,'contact.deleted','contact',$2::uuid)`,[owner,id],
    );
    return {deleted:true};
  });
}
export function createContactRouter({pool,publicOrigin,noticeVersion,ipPepper,enabled=false}={}){
  const router=express.Router();
  if(!enabled)return router;
  if(!pool?.query||typeof noticeVersion!=="string"||noticeVersion.length>80||
     typeof publicOrigin!=="string"||!ipPepper)throw Error("Contact safety config is incomplete");
  const origin=new URL(publicOrigin).origin;
  router.post("/",async(req,res,next)=>{
    try{
      if(req.headers.origin!==origin)throw fail("CONTACT_ORIGIN",403,"Origin mismatch");
      const data=await receiveContact(pool,{
        payload:req.body,noticeVersion,
        ipDigest:digestClientIp(req.socket.remoteAddress||"",ipPepper),
      });
      res.set("Cache-Control","no-store").status(202).json(data);
    }catch(error){next(error);}
  });
  return router;
}
