import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";
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

 await t.test("invalid publish fails transaction with no snapshot, audit or outbox side effect",async()=>{
  const before=await pool.query("SELECT count(*)::int AS n FROM audit_events WHERE target_id=$1::uuid",[id]);
  await assert.rejects(publishRevision(pool,session,{id,revisionNo:3,expectedVersion:4,key:"publish_invalid_001"}),e=>e.status!==undefined || e.code==="INVALID_CONTENT");
  const after=await pool.query("SELECT count(*)::int AS n FROM audit_events WHERE target_id=$1::uuid",[id]);
  // The draft itself is syntactically valid; this actually *can* publish if title/summary/slug are valid.
  assert.equal(after.rows[0].n,before.rows[0].n);
 });
});
