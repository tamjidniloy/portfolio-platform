import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import test from "node:test";
import pg from "pg";
import express from "express";
import { releaseMigrationPlan, applyReleaseMigrations } from "../../server/persistence/release-migrations.js";
import { createSessionForVerifiedOwner, resolveOwnerSession } from "../../server/identity/session-store.js";
import { csrfTokenForSession } from "../../server/identity/csrf.js";
import {
  validateMediaIntent, sniffMediaMime, validateStoredMedia,
} from "../../server/integrations/media-validation.js";
import {
  createMediaIntent,listMedia,finalizeMedia,retireMedia,
} from "../../server/integrations/media-service.js";
import { receiveContact,listMessages,deleteMessage,digestClientIp } from "../../server/integrations/contact.js";
import { runOutboxOnce,deadLetterSummary } from "../../server/integrations/outbox.js";
import { createEmailProvider, createCachePurger } from "../../server/integrations/providers.js";
import { createCmsApiRouter } from "../../server/cms/http.js";
import { createDraft,publishRevision } from "../../server/cms/service.js";
const sha=b=>createHash("sha256").update(b).digest("hex");
const image=Buffer.from([137,80,78,71,13,10,26,10,0,0,0,0,1,2,3,4]);
const ip=sha("fake-ip fixture only");
const good={name:"test.png",mime:"image/png",size:image.byteLength,sha256:sha(image)};
const pepper="a-secret-pepper-used-only-for-isolated-integration-tests-000";
const notice="ci-privacy-notice-v1";

test("Phase 04.4 real PostgreSQL media, contact, outbox, consent and least-leak integration",async t=>{
  const url=process.env.INTEGRATION_TEST_DATABASE_URL;
  const u=new URL(url||"invalid:");
  if(process.env.NODE_ENV==="production"||u.hostname!=="127.0.0.1"||
    u.pathname!=="/devfolio_integrations_ci")throw Error("Refuse non-disposable integration database");
  const pool=new pg.Pool({connectionString:url,max:8,connectionTimeoutMillis:3000});
  t.after(async()=>pool.end());
  const plan=await releaseMigrationPlan();
  assert.equal(plan.length,5);
  await applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan,apply:true,confirmDatabase:"devfolio_integrations_ci"});
  const owner=(await pool.query(
    "INSERT INTO admin_users(email,status) VALUES($1,'active') RETURNING id",
    ["integration-"+randomUUID()+"@invalid.test"],
  )).rows[0].id;
  const sessionToken=(await createSessionForVerifiedOwner(pool,{ownerId:owner})).token;
  const session=await resolveOwnerSession(pool,sessionToken);
  await pool.query("INSERT INTO site_private_config(private_config) VALUES($1::jsonb)",[JSON.stringify({contactEnabled:true})]);
  const deleted=[];
  const storage={
    async createUpload({key,mime,size}){
      assert.ok(key.startsWith("private/staging/"));
      assert.equal(mime,"image/png");
      assert.equal(size,image.length);
      return {method:"POST",url:"https://storage.invalid.example/upload",fields:{"Content-Type":mime},expiresInSeconds:300};
    },
    async inspect({key,mime,size,sha256}){
      assert.ok(key.includes("private/staging/"));
      return validateStoredMedia({body:(async function*(){yield image;})(),expectedSize:size,expectedMime:mime,expectedSha256:sha256});
    },
    async delete({key}){deleted.push(key);}
  };

  await t.test("rejected media signature/oversize and digest cannot become ready",async()=>{
    assert.equal(sniffMediaMime(image),"image/png");
    assert.throws(()=>validateMediaIntent({...good,mime:"image/svg+xml"}),e=>e.status===422);
    assert.throws(()=>validateMediaIntent({...good,size:9*1024*1024}),e=>e.status===422);
    await assert.rejects(validateStoredMedia({
      body:(async function*(){yield Buffer.from("malicious");})(),
      expectedMime:good.mime,expectedSize:good.size,expectedSha256:good.sha256,
    }),e=>e.status===422);
  });

  let attachedId;
  await t.test("private intent, exact-byte verification, immutable attachment and safe retirement",async()=>{
    const staged=await createMediaIntent(pool,session,storage,good);
    attachedId=staged.id;
    assert.equal(staged.state,"staging");
    assert.equal((await finalizeMedia(pool,session,storage,staged.id)).state,"ready");
    assert.equal((await finalizeMedia(pool,session,storage,staged.id)).state,"ready");
    assert.equal((await listMedia(pool,session)).items.length,1);
    const record=await createDraft(pool,session,{
      type:"project",key:"media_asset_project_001",
      payload:{title:"Attachment test",summary:"Attached safely",slug:"attached-example",
        role:"Developer",problem:"Problem",approach:"Approach",outcome:"Outcome",
        limitations:"Limitations",mediaIds:[staged.id]},
    });
    const count=await pool.query("SELECT count(*)::int AS n FROM media_references WHERE media_id=$1::uuid",[staged.id]);
    assert.equal(count.rows[0].n,1);
    await assert.rejects(retireMedia(pool,session,staged.id),e=>e.status===409);
    const published=await publishRevision(pool,session,{
      id:record.id,revisionNo:1,expectedVersion:1,key:"media_asset_publish_001",
    });
    assert.equal(published.publicPath,"/projects/attached-example");
    const asset=await createMediaIntent(pool,session,storage,good);
    assert.equal((await finalizeMedia(pool,session,storage,asset.id)).state,"ready");
    assert.equal((await retireMedia(pool,session,asset.id)).state,"retired");
    const before=deleted.length;
    const result=await runOutboxOnce(pool,{storage,email:{async send(){}},cache:{async purge(){}}});
    assert.ok(result.processed>=1);
    assert.equal(deleted.length,before+1);
    assert.equal((await pool.query("SELECT state FROM media_assets WHERE id=$1::uuid",[asset.id])).rows[0].state,"retired");
  });

  let receipt;
  await t.test("consent/version controls, hashed IP rate limits and stored contact independent of email",async()=>{
    assert.notEqual(digestClientIp("192.0.2.1",pepper),"192.0.2.1");
    assert.equal(digestClientIp("192.0.2.1",pepper),digestClientIp("192.0.2.1",pepper));
    const basic={name:"Sender",email:"Sender@example.com",message:"Hello with factual inquiry",consent:true,notice};
    await assert.rejects(receiveContact(pool,{payload:{...basic,consent:false},ipDigest:ip,noticeVersion:notice}),e=>e.status===422);
    await assert.rejects(receiveContact(pool,{payload:{...basic,notice:"old"},ipDigest:ip,noticeVersion:notice}),e=>e.status===422);
    const first=await receiveContact(pool,{payload:basic,ipDigest:ip,noticeVersion:notice});
    assert.equal(first.received,true);
    assert.equal(first.notification,"queued");
    receipt=first.receiptId;
    assert.equal((await listMessages(pool,session)).items.length,1);
    const q=await pool.query("SELECT sender_email,request_ip_digest,retention_until FROM contact_messages WHERE id=$1::uuid",[receipt]);
    assert.equal(q.rows[0].sender_email,"sender@example.com");
    assert.equal(q.rows[0].request_ip_digest,ip);
    assert.ok(new Date(q.rows[0].retention_until).getTime()>Date.now()+85*86400000);
    await receiveContact(pool,{payload:basic,ipDigest:ip,noticeVersion:notice});
    await receiveContact(pool,{payload:basic,ipDigest:ip,noticeVersion:notice});
    await assert.rejects(receiveContact(pool,{payload:basic,ipDigest:ip,noticeVersion:notice}),e=>e.status===429);
  });

  await t.test("real HTTP public contact, mandatory origin, guarded media and inbox endpoints",async t2=>{
    const app=express();
    const server=await new Promise(resolve=>{
      const s=app.listen(0,"127.0.0.1",()=>resolve(s));
    });
    t2.after(()=>new Promise(resolve=>server.close(resolve)));
    const origin="http://127.0.0.1:"+server.address().port;
    const secret="integration-only-strong-csrf-secret-012345678901234";
    app.use("/api/v1",createCmsApiRouter({
      pool,publicPool:pool,publicOrigin:origin,csrfSecret:secret,storage,
      contactConfig:{enabled:true,noticeVersion:notice,ipPepper:pepper},
    }));
    const a=await fetch(origin+"/api/v1/admin/media");
    assert.equal(a.status,401);
    const bad=await fetch(origin+"/api/v1/contact",{
      method:"POST",headers:{"Content-Type":"application/json",Origin:"https://evil.example"},
      body:JSON.stringify({name:"X",email:"x@y.example",message:"No",notice,consent:true}),
    });
    assert.equal(bad.status,403);
    const ok=await fetch(origin+"/api/v1/contact",{
      method:"POST",headers:{"Content-Type":"application/json",Origin:origin},
      body:JSON.stringify({name:"HTTP test",email:"test@example.com",message:"HTTP request",notice,consent:true}),
    });
    assert.equal(ok.status,202);
    const csrf=csrfTokenForSession(sessionToken,secret);
    const headers={Cookie:"devfolio_session="+sessionToken,Origin:origin,"X-CSRF-Token":csrf,
      "Content-Type":"application/json"};
    const noCsrf=await fetch(origin+"/api/v1/admin/media/intents",{
      method:"POST",headers:{Cookie:headers.Cookie,Origin:origin,"Content-Type":"application/json"},
      body:JSON.stringify(good),
    });
    assert.equal(noCsrf.status,403);
    const intent=await fetch(origin+"/api/v1/admin/media/intents",{
      method:"POST",headers,body:JSON.stringify(good),
    });
    assert.equal(intent.status,201);
    const created=await intent.json();
    assert.equal((await fetch(origin+"/api/v1/admin/media/"+created.id+"/finalize",{
      method:"POST",headers,body:"{}",
    })).status,200);
    const inbox=await fetch(origin+"/api/v1/admin/messages",{headers:{Cookie:headers.Cookie}});
    assert.equal(inbox.status,200);
    assert.ok((await inbox.json()).items.length>=4);
    const audit=await fetch(origin+"/api/v1/admin/audit",{headers:{Cookie:headers.Cookie}});
    assert.equal(audit.status,200);
  });

  await t.test("provider dispatch retries, private message deletion and zero-contact-body outbox",async()=>{
    const q=await pool.query("SELECT safe_payload FROM outbox_events WHERE event_type='contact.notify' AND aggregate_id=$1::uuid",[receipt]);
    assert.deepEqual(q.rows[0].safe_payload,{});
    const failed=await runOutboxOnce(pool,{
      storage,email:{async send(){throw Error("RESEND_HTTP_503");}},
      cache:{async purge(){}},
    });
    assert.ok(failed.retry>=1);
    await pool.query("UPDATE outbox_events SET available_at=now() WHERE processed_at IS NULL");
    let delivered=0;
    const success=await runOutboxOnce(pool,{
      storage,email:{async send({id,message}){assert.ok(id);assert.ok(message);delivered++;}},
      cache:{async purge(paths){assert.ok(paths.includes("/sitemap.xml"));}},
    });
    assert.ok(success.processed>=1);
    assert.ok(delivered>0);
    await deleteMessage(pool,session,receipt);
    const wiped=await pool.query("SELECT message_body,request_ip_digest,deleted_at FROM contact_messages WHERE id=$1::uuid",[receipt]);
    assert.equal(wiped.rows[0].message_body,"[deleted]");
    assert.equal(wiped.rows[0].request_ip_digest,null);
    assert.ok(wiped.rows[0].deleted_at);
    const queue=await deadLetterSummary(pool);
    assert.deepEqual(queue,[]);
    assert.equal(attachedId!==undefined,true);
  });

  await t.test("dead-letter exhausted events are visible without message data",async()=>{
    const id=randomUUID();
    const row=await pool.query(
      `INSERT INTO contact_messages(sender_name,sender_email,message_body,consent_at,
       notice_version,retention_until) VALUES('Failure case','failure@invalid.test','Undelivered',
       now(),$1,now()+interval '90 days') RETURNING id`,[notice],
    );
    await pool.query(
      `INSERT INTO outbox_events(id,event_type,dedupe_key,aggregate_id,safe_payload)
       VALUES($1::uuid,'contact.notify',$2,$3::uuid,'{}'::jsonb)`,
      [id,"ci-dead-letter:"+id,row.rows[0].id],
    );
    for(let attempt=0;attempt<5;attempt++){
      const r=await runOutboxOnce(pool,{
        batch:25,storage,email:{async send(){throw Error("RESEND_HTTP_503");}},
        cache:{async purge(){}},
      });
      assert.ok(r.claimed>=1);
      await pool.query("UPDATE outbox_events SET available_at=now() WHERE id=$1::uuid",[id]);
    }
    const record=await pool.query(
      "SELECT dead_lettered_at,attempts,last_error_code FROM outbox_events WHERE id=$1::uuid",[id],
    );
    assert.equal(record.rows[0].attempts,5);
    assert.equal(record.rows[0].last_error_code,"RESEND_HTTP_503");
    assert.ok(record.rows[0].dead_lettered_at);
    const summary=await deadLetterSummary(pool);
    assert.ok(summary.some(x=>x.eventType==="contact.notify"&&x.code==="RESEND_HTTP_503"));
    assert.equal(JSON.stringify(summary).includes("sender@example.com"),false);
  });

  await t.test("provider outbound requests are pinned, idempotent and validate purge acknowledgement",async()=>{
    const calls=[];
    const fetchStub=async(url,opts)=>{
      calls.push({url,opts});
      return {ok:true,async json(){return {success:true,id:"fixture-id"};}};
    };
    const email=createEmailProvider({
      EMAIL_PROVIDER:"resend",RESEND_API_KEY:"private-test-key",
      CONTACT_FROM_EMAIL:"sender@example.test",CONTACT_OWNER_EMAIL:"inbox@example.test",
    },fetchStub);
    await email.send({id:randomUUID(),name:"X",email:"x@y.example",message:"hello"});
    assert.equal(calls[0].url,"https://api.resend.com/emails");
    assert.ok(calls[0].opts.headers["Idempotency-Key"]);
    const cache=createCachePurger({
      CACHE_PURGE_MODE:"cloudflare",
      CLOUDFLARE_ZONE_ID:"a".repeat(32),CLOUDFLARE_API_TOKEN:"test-not-real",
      CMS_PUBLIC_ORIGIN:"https://portfolio.example/",
    },fetchStub);
    await cache.purge(["/projects","/sitemap.xml"]);
    assert.equal(calls[1].url,"https://api.cloudflare.com/client/v4/zones/"+"a".repeat(32)+"/purge_cache");
    assert.deepEqual(JSON.parse(calls[1].opts.body).files,
      ["https://portfolio.example/projects","https://portfolio.example/sitemap.xml"]);
  });
});
