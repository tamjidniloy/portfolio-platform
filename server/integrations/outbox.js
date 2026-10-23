import { withTransaction } from "../persistence/unit-of-work.js";

const MAX_ATTEMPTS=5;
const ERROR_CODES=new Set(["EMAIL_UNAVAILABLE","MEDIA_UNAVAILABLE","CACHE_PURGE_FAILED",
  "CONTACT_DELETED","UNSUPPORTED_EVENT","MEDIA_DELETE_FAILED"]);
const sanitizedError=message=>{
  if(typeof message!=="string")return "PROVIDER_FAILURE";
  const trimmed=message.match(/^(RESEND_HTTP_\d{3}|CLOUDFLARE_HTTP_\d{3}|CLOUDFLARE_PURGE_NOT_ACCEPTED)$/);
  return trimmed?trimmed[1]:"PROVIDER_FAILURE";
};
export async function claimOutbox(pool,{batch=5,leaseSeconds=60}={}){
  if(!Number.isInteger(batch)||batch<1||batch>25||!Number.isInteger(leaseSeconds)||
     leaseSeconds<30||leaseSeconds>300)throw Error("Invalid outbox claim settings");
  return withTransaction(pool,async client=>{
    const r=await client.query(
      `WITH due AS (
         SELECT id FROM outbox_events
         WHERE processed_at IS NULL AND dead_lettered_at IS NULL
           AND available_at<=now() AND (claimed_until IS NULL OR claimed_until<now())
         ORDER BY available_at,id FOR UPDATE SKIP LOCKED LIMIT $1
       )
       UPDATE outbox_events e SET
        claimed_until=now()+make_interval(secs=>$2),
        attempts=attempts+1
       FROM due WHERE e.id=due.id
       RETURNING e.id,e.event_type,e.aggregate_id,e.safe_payload,e.attempts`,
      [batch,leaseSeconds],
    );
    return r.rows;
  });
}
async function deliver(pool,event,{storage,email,cache}){
  if(event.event_type==="contact.notify"){
    if(!email)throw Error("EMAIL_UNAVAILABLE");
    const r=await pool.query(
      `SELECT id,sender_name,sender_email,message_body,deleted_at
       FROM contact_messages WHERE id=$1::uuid`,[event.aggregate_id],
    );
    if(!r.rows.length||r.rows[0].deleted_at)return;
    const row=r.rows[0];
    await email.send({id:event.id,name:row.sender_name,email:row.sender_email,message:row.message_body});
    return;
  }
  if(event.event_type==="media.delete"){
    if(!storage)throw Error("MEDIA_UNAVAILABLE");
    const row=await pool.query(
      "SELECT storage_key,state FROM media_assets WHERE id=$1::uuid",
      [event.aggregate_id],
    );
    if(!row.rows.length)return;
    if(!["retired","rejected"].includes(row.rows[0].state))throw Error("MEDIA_DELETE_FAILED");
    const linked=await pool.query("SELECT 1 FROM media_references WHERE media_id=$1::uuid LIMIT 1",[event.aggregate_id]);
    if(linked.rowCount)throw Error("MEDIA_DELETE_FAILED");
    await storage.delete({key:row.rows[0].storage_key});
    return;
  }
  if(["content.published","content.unpublished"].includes(event.event_type)){
    if(!cache)throw Error("CACHE_PURGE_FAILED");
    const path=event.safe_payload?.publicPath;
    const area=typeof path==="string"&&path.startsWith("/research/")?"/research":
      typeof path==="string"&&path.startsWith("/writing/")?"/writing":"/projects";
    const paths=["/","/sitemap.xml",area,
      "/api/v1/public/site",area==="/writing"?"/writing":"/api/v1/public"+area,
      ...(typeof path==="string"&&/^\/[a-z0-9/-]{1,255}$/.test(path)?[path]:[])];
    await cache.purge(paths);
    return;
  }
  throw Error("UNSUPPORTED_EVENT");
}
export async function runOutboxOnce(pool,{storage,email,cache,batch=5}={}){
  const events=await claimOutbox(pool,{batch});
  const status={claimed:events.length,processed:0,retry:0,dead:0};
  for(const event of events){
    try{
      await deliver(pool,event,{storage,email,cache});
      const result=await pool.query(
        `UPDATE outbox_events SET processed_at=now(),claimed_until=NULL,last_error_code=NULL
         WHERE id=$1::uuid AND processed_at IS NULL AND dead_lettered_at IS NULL
           AND claimed_until>now() RETURNING id`,[event.id],
      );
      status.processed+=result.rowCount;
    }catch(error){
      const code=ERROR_CODES.has(error.message)?error.message:sanitizedError(error.message);
      const dead=event.attempts>=MAX_ATTEMPTS;
      await pool.query(
        `UPDATE outbox_events SET
         claimed_until=NULL,
         available_at=CASE WHEN $2 THEN available_at ELSE now()+make_interval(secs=>LEAST(3600,POWER(3,attempts)::integer*30)) END,
         dead_lettered_at=CASE WHEN $2 THEN now() ELSE NULL END,
         last_error_code=$3
         WHERE id=$1::uuid AND processed_at IS NULL AND dead_lettered_at IS NULL`,
        [event.id,dead,code],
      );
      status[dead?"dead":"retry"]++;
    }
  }
  return status;
}
export async function deadLetterSummary(pool){
  const r=await pool.query(
    `SELECT event_type,count(*)::int AS count,last_error_code
     FROM outbox_events WHERE dead_lettered_at IS NOT NULL
     GROUP BY event_type,last_error_code ORDER BY count(*) DESC`,
  );
  // No contact body/email, token, IP, or object key in returned alert details.
  return r.rows.map(x=>({eventType:x.event_type,count:x.count,code:x.last_error_code}));
}
