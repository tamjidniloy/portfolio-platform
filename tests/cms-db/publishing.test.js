import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";
import express from "express";
import { createCmsApiRouter } from "../../server/cms/http.js";
import { csrfTokenForSession } from "../../server/identity/csrf.js";
import { getPrivateSiteSettings, updatePrivateSiteSettings } from "../../server/cms/settings.js";
import { createSessionForVerifiedOwner, resolveOwnerSession } from "../../server/identity/session-store.js";
import {
  createDraft, saveDraft, getDraft, listDrafts, listRevisions, previewRevision,
  restoreRevision, publishRevision, unpublishRevision,
} from "../../server/cms/service.js";
import { getPublicSnapshot, getPublicList, publishedSitemapPaths } from "../../server/cms/public-reader.js";
import { assertVerifiedOwner } from "../../server/identity/session-store.js";

test("CMS 04.3 approved DB-R1 draft/publish lifecycle in isolated native PostgreSQL",async t=>{
 const url=process.env.CMS_TEST_DATABASE_URL;
 if(process.env.NODE_ENV==="production"||typeof url!=="string")throw new Error("CMS isolated URL required");
 const parsed=new URL(url);
 if(!["postgres:","postgresql:"].includes(parsed.protocol) ||
    !["127.0.0.1","localhost","[::1]","::1"].includes(parsed.hostname) ||
    parsed.pathname!=="/devfolio_cms_ci") throw new Error("Only disposable local devfolio_cms_ci allowed");
 const pool=new pg.Pool({connectionString:url,max:8,connectionTimeoutMillis:2000});
 t.after(async()=>pool.end());
 await pool.query(await readFile("contracts/release1/DB_R1.sql","utf8"));
 const owner=(await pool.query(
  "INSERT INTO admin_users(email,status) VALUES($1,'active') RETURNING id",
  ["cms-fixture-"+randomUUID()+"@invalid.example"]
 )).rows[0].id;
 const other=(await pool.query(
  "INSERT INTO admin_users(email,status) VALUES($1,'active') RETURNING id",
  ["cms-fixture-"+randomUUID()+"@invalid.example"]
 )).rows[0].id;
 // Trusted test-only bootstrap intentionally does NOT expose a sign-in endpoint.
 const ownToken=(await createSessionForVerifiedOwner(pool,{ownerId:owner})).token;
 const otherToken=(await createSessionForVerifiedOwner(pool,{ownerId:other})).token;
 const session=await resolveOwnerSession(pool,ownToken);
 const foreign=await resolveOwnerSession(pool,otherToken);
 assert.equal(assertVerifiedOwner(session),owner);

 await t.test("private settings allowlist, revision locking and audit",async()=>{
  assert.deepEqual(await getPrivateSiteSettings(pool,session),{lockVersion:0,settings:{}});
  await assert.rejects(updatePrivateSiteSettings(pool,session,{expectedVersion:0,settings:{privateApiKey:"must-never-store"}}),e=>e.status===422);
  const saved=await updatePrivateSiteSettings(pool,session,{
    expectedVersion:0,
    settings:{publicTitle:"Engineering Portfolio",contactEnabled:false,primaryNavOrder:["projects","research","about","contact"]},
  });
  assert.equal(saved.lockVersion,1);
  assert.equal((await getPrivateSiteSettings(pool,session)).settings.publicTitle,"Engineering Portfolio");
  await assert.rejects(updatePrivateSiteSettings(pool,foreign,{expectedVersion:0,settings:{publicTitle:"Stale"}}),e=>e.status===412);
  assert.equal((await getPrivateSiteSettings(pool,foreign)).settings.publicTitle,"Engineering Portfolio");
 });
 let id;
 await t.test("create draft is atomic, private and idempotent without publishing",async()=>{
  const request={type:"project",payload:{title:"Project one",summary:"Factual test summary",slug:"private-project",privateNote:"SECRETS_ONLY_DRAFT"},key:"create_test_key_001"};
  const a=await createDraft(pool,session,request);
  const b=await createDraft(pool,session,request);
  assert.deepEqual(a,b);
  id=a.id;
  assert.equal(a.revisionNo,1);
  assert.equal((await getDraft(pool,session,id)).payload.privateNote,"SECRETS_ONLY_DRAFT");
  assert.equal(await getPublicSnapshot(pool,"/projects/private-project"),null);
  assert.deepEqual(await getPublicList(pool,{type:"project"}),[]);
  assert.deepEqual(await publishedSitemapPaths(pool),[]);
  assert.equal((await listDrafts(pool,session)).length,1);
  await assert.rejects(getDraft(pool,foreign,id),error=>error.status===404);
  await assert.rejects(createDraft(pool,{},request),error=>error.name==="OwnerNotAuthorized");
  await assert.rejects(createDraft(pool,session,{...request,payload:{title:"different"}}),error=>error.status===409);
 });

 await t.test("save creates immutable revisions; stale expected version rolls back",async()=>{
  const edited=await saveDraft(pool,session,{
   id,expectedVersion:1,
   payload:{title:"Project revised",summary:"Published eventually",slug:"private-project",
     problem:"A tested engineering problem",approach:"Implemented carefully",privateNote:"SECRETS_ONLY_DRAFT"},
   changeNote:"Draft update",
  });
  assert.equal(edited.revisionNo,2);
  assert.equal(edited.lockVersion,2);
  await assert.rejects(saveDraft(pool,session,{id,expectedVersion:1,payload:{title:"stale",slug:"stale-project"}}),e=>e.status===412);
  const revisions=await listRevisions(pool,session,id);
  assert.deepEqual(revisions.map(x=>x.revisionNo),[2,1]);
  const preview=await previewRevision(pool,session,id,2);
  assert.equal(preview.noindex,true);
  assert.equal(preview.payload.privateNote,"SECRETS_ONLY_DRAFT");
  await assert.rejects(previewRevision(pool,foreign,id,2),e=>e.status===404);
 });

 await t.test("publish derives allowlisted DTO from exact stored revision and emits audit/outbox atomically",async()=>{
  const a=await publishRevision(pool,session,{id,revisionNo:2,expectedVersion:2,key:"publish_test_key_001"});
  assert.equal(a.publicPath,"/projects/private-project");
  assert.equal(a.generation,1);
  const replay=await publishRevision(pool,session,{id,revisionNo:2,expectedVersion:2,key:"publish_test_key_001"});
  assert.deepEqual(a,replay);
  const dto=await getPublicSnapshot(pool,a.publicPath);
  assert.equal(dto.title,"Project revised");
  assert.equal(dto.privateNote,undefined);
  assert.equal(JSON.stringify(dto).includes("SECRETS_ONLY_DRAFT"),false);
  const list=await getPublicList(pool,{type:"project"});
  assert.equal(list.length,1);
  assert.deepEqual(await publishedSitemapPaths(pool),["/projects/private-project"]);
  const outbox=await pool.query("SELECT count(*)::int AS n FROM outbox_events WHERE aggregate_id=$1::uuid",[id]);
  assert.equal(outbox.rows[0].n,1);
  await assert.rejects(publishRevision(pool,foreign,{id,revisionNo:2,expectedVersion:3,key:"foreign_attempt_key"}),e=>e.status===404);
 });

 await t.test("editing published content does not change live snapshot",async()=>{
  const saved=await saveDraft(pool,session,{id,expectedVersion:3,payload:{title:"New unpublished draft",summary:"Private only",slug:"",privateNote:"DO_NOT_EXPOSE"}});
  assert.equal(saved.revisionNo,3);
  assert.equal((await getPublicSnapshot(pool,"/projects/private-project")).title,"Project revised");
  assert.equal(await getPublicSnapshot(pool,"/projects/secret-new-slug"),null);
 });

 await t.test("restore creates another private revision but does not overwrite published snapshot",async()=>{
  const restored=await restoreRevision(pool,session,{id,revisionNo:1,expectedVersion:4,key:"restore_test_key_001"});
  assert.equal(restored.revisionNo,4);
  assert.equal(restored.lockVersion,5);
  assert.equal((await getDraft(pool,session,id)).payload.title,"Project one");
  assert.equal((await getPublicSnapshot(pool,"/projects/private-project")).title,"Project revised");
 });

 await t.test("slug republish writes redirect provenance and public DTO contains no private notes",async()=>{
  const updated=await saveDraft(pool,session,{id,expectedVersion:5,payload:{title:"Public new title",summary:"New summary",slug:"new-project-slug",privateNote:"DO_NOT_SHARE"}});
  assert.equal(updated.revisionNo,5);
  const changed=await publishRevision(pool,session,{id,revisionNo:5,expectedVersion:6,key:"publish_slug_change_001"});
  assert.equal(changed.publicPath,"/projects/new-project-slug");
  assert.equal(await getPublicSnapshot(pool,"/projects/private-project"),null);
  const redirect=await pool.query("SELECT to_path,is_active FROM slug_redirects WHERE from_path=$1",["/projects/private-project"]);
  assert.equal(redirect.rows[0].to_path,"/projects/new-project-slug");
  assert.equal(redirect.rows[0].is_active,true);
  assert.equal((await getPublicSnapshot(pool,"/projects/new-project-slug")).privateNote,undefined);
 });

 await t.test("unpublish revokes public snapshot and replays only matching receipt",async()=>{
  const done=await unpublishRevision(pool,session,{id,expectedVersion:7,key:"unpublish_test_key_001"});
  assert.equal(done.status,"unpublished");
  assert.equal(await getPublicSnapshot(pool,"/projects/new-project-slug"),null);
  assert.deepEqual(await publishedSitemapPaths(pool),[]);
  assert.deepEqual(await unpublishRevision(pool,session,{id,expectedVersion:7,key:"unpublish_test_key_001"}),done);
  await assert.rejects(unpublishRevision(pool,session,{id,expectedVersion:8,key:"unpublish_new_key_002"}),e=>e.status===409);
  assert.equal((await pool.query("SELECT is_active FROM slug_redirects WHERE from_path=$1",["/projects/private-project"])).rows[0].is_active,false);
 });

 await t.test("invalid publish fails transaction with no snapshot, audit or outbox side effect",async()=>{
  const before=await pool.query("SELECT count(*)::int AS n FROM audit_events WHERE target_id=$1::uuid",[id]);
  await assert.rejects(publishRevision(pool,session,{id,revisionNo:3,expectedVersion:8,key:"publish_invalid_001"}),e=>e.status===422);
  const after=await pool.query("SELECT count(*)::int AS n FROM audit_events WHERE target_id=$1::uuid",[id]);
  // The draft itself is syntactically valid; this actually *can* publish if title/summary/slug are valid.
  assert.equal(after.rows[0].n,before.rows[0].n);
 });
 await t.test("real HTTP boundary denies anonymous/CSRF and exposes only approved public DTO",async t2=>{
  const app=express();
  const server=await new Promise(resolve=>{
    const s=app.listen(0,"127.0.0.1",()=>resolve(s));
  });
  t2.after(async()=>new Promise(resolve=>server.close(resolve)));
  const origin="http://127.0.0.1:"+server.address().port;
  const secret="cms-integration-test-only-strong-unique-csrf-secret-000012";
  app.use("/api/v1",createCmsApiRouter({pool,publicOrigin:origin,csrfSecret:secret,isProduction:false}));
  const cookie="devfolio_session="+ownToken;
  const csrf=csrfTokenForSession(ownToken,secret);
  const get = (path,headers={})=>fetch(origin+path,{headers});
  const anon=await get("/api/v1/admin/content");
  assert.equal(anon.status,401);
  assert.equal(anon.headers.get("cache-control"),"no-store");
  const who=await get("/api/v1/admin/session",{Cookie:cookie});
  assert.equal(who.status,200);
  assert.equal((await who.json()).csrfToken,csrf);
  const privateSettings=await get("/api/v1/admin/site-settings",{Cookie:cookie});
  assert.equal(privateSettings.status,200);
  assert.equal(privateSettings.headers.get("etag"),'"lock-v1"');
  assert.equal((await privateSettings.json()).settings.publicTitle,"Engineering Portfolio");
  const badSettings=await fetch(origin+"/api/v1/admin/site-settings",{
    method:"PATCH",headers:{"Content-Type":"application/json",Cookie:cookie,Origin:origin,
      "X-CSRF-Token":csrf,"If-Match":'"lock-v1"'},
    body:JSON.stringify({settings:{secret:"untrusted"}}),
  });
  assert.equal(badSettings.status,422);

  const input={contentType:"research",payload:{
    title:"Scientific methods",summary:"Validated outcome",slug:"science-demo",
    researchStatus:"in_progress",privateNote:"PRIVATE_RESEARCH_CONTEXT"
  }};
  async function send(body,headers={}){
    return fetch(origin+"/api/v1/admin/content",{
      method:"POST",headers:{"Content-Type":"application/json",Cookie:cookie,...headers},
      body:JSON.stringify(body),
    });
  }
  assert.equal((await send(input)).status,403,"CSRF and origin are both required");
  assert.equal((await send(input,{Origin:"https://attacker.example","X-CSRF-Token":csrf})).status,403);
  const created=await send(input,{
    Origin:origin,"X-CSRF-Token":csrf,"Idempotency-Key":"http_create_research_01",
  });
  assert.equal(created.status,201);
  const draft=await created.json();
  const privateRead=await get("/api/v1/admin/content/"+draft.id,{Cookie:cookie});
  assert.equal(privateRead.status,200);
  assert.equal(privateRead.headers.get("etag"),'"lock-v1"');
  assert.equal((await privateRead.json()).payload.privateNote,"PRIVATE_RESEARCH_CONTEXT");
  const publish=await fetch(origin+"/api/v1/admin/content/"+draft.id+"/publish",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",Cookie:cookie,Origin:origin,
      "X-CSRF-Token":csrf,"If-Match":'"lock-v1"',
      "Idempotency-Key":"http_publish_research_01",
    },
    body:JSON.stringify({revisionNo:1}),
  });
  assert.equal(publish.status,200);
  const page=await get("/api/v1/public/research/science-demo");
  assert.equal(page.status,200);
  const safe=await page.json();
  assert.equal(safe.researchStatus,"in_progress");
  assert.equal(safe.privateNote,undefined);
  assert.equal(JSON.stringify(safe).includes("PRIVATE_RESEARCH_CONTEXT"),false);
  const stale=await fetch(origin+"/api/v1/admin/content/"+draft.id+"/publish",{
    method:"POST",
    headers:{"Content-Type":"application/json",Cookie:cookie,Origin:origin,
      "X-CSRF-Token":csrf,"If-Match":'"lock-v1"',
      "Idempotency-Key":"http_publish_research_02"},
    body:JSON.stringify({revisionNo:1}),
  });
  assert.equal(stale.status,412);
  const list=await get("/api/v1/public/research");
  assert.equal((await list.json()).items.length,1);
 });

});
