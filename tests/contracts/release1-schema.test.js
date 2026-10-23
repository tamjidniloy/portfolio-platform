/**
 * Owner-approved DB-R1 reference DDL validation; isolated disposable CI database.
 * This does NOT install approved production migration or activate owner login.
 */
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import pg from "pg";

function assertRelease1TestDatabase(connection, mode) {
  if (mode === "production" || typeof connection !== "string") throw new Error("Production and missing URLs are forbidden");
  const url = new URL(connection);
  if (!["postgresql:","postgres:"].includes(url.protocol) ||
      !["127.0.0.1","localhost","[::1]","::1"].includes(url.hostname) ||
      url.pathname !== "/devfolio_release1_contract_ci") {
    throw new Error("DB-R1 test must target the disposable local devfolio_release1_contract_ci database");
  }
}

test("DB-R1 19-table owner-approved schema is syntactically valid and constrained in isolated PostgreSQL", async (t) => {
  const url=process.env.CONTRACT_DATABASE_URL;
  assertRelease1TestDatabase(url,process.env.NODE_ENV);
  const pool=new pg.Pool({connectionString:url,max:3,connectionTimeoutMillis:1500});
  t.after(async()=>pool.end());
  const ddl=await readFile("contracts/release1/DB_R1.sql","utf8");
  await pool.query(ddl);
  const count=await pool.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='public'");
  assert.equal(count.rows[0].n,19);

  const created=await pool.query("INSERT INTO admin_users(email,status) VALUES($1,'active') RETURNING id",["owner@invalid.test"]);
  const ownerId=created.rows[0].id;
  await t.test("case-insensitive owner email uniqueness",async()=>{
    await assert.rejects(pool.query("INSERT INTO admin_users(email) VALUES($1)",["OWNER@invalid.test"]),(err)=>err.code==="23505");
  });
  await t.test("passkey credential custody and foreign key enforcement",async()=>{
    const id=randomBytes(32),key=randomBytes(80);
    await pool.query("INSERT INTO webauthn_credentials(admin_user_id,credential_id,public_key) VALUES($1::uuid,$2,$3)",[ownerId,id,key]);
    await assert.rejects(pool.query("INSERT INTO webauthn_credentials(admin_user_id,credential_id,public_key) VALUES($1::uuid,$2,$3)",[ownerId,id,key]),err=>err.code==="23505");
    await assert.rejects(pool.query("INSERT INTO webauthn_credentials(admin_user_id,credential_id,public_key) VALUES($1::uuid,$2,$3)",[randomUUID(),randomBytes(32),key]),err=>err.code==="23503");
  });
  await t.test("session digest format and valid owner references",async()=>{
    await assert.rejects(pool.query("INSERT INTO admin_sessions(admin_user_id,token_digest,expires_at) VALUES($1::uuid,'raw-token',now()+interval '1 hour')",[ownerId]),err=>err.code==="23514");
    await pool.query("INSERT INTO admin_sessions(admin_user_id,token_digest,expires_at) VALUES($1::uuid,$2,now()+interval '1 hour')",[ownerId,randomBytes(32).toString("hex")]);
  });
  await t.test("contact consent, notice version and future retention are mandatory",async()=>{
    await assert.rejects(pool.query("INSERT INTO contact_messages(sender_name,sender_email,message_body,consent_at,notice_version,retention_until) VALUES ('a','a@b.test','hello',now(),'1',now()-interval '1 day')"),err=>err.code==="23514");
    await pool.query("INSERT INTO contact_messages(sender_name,sender_email,message_body,consent_at,notice_version,retention_until) VALUES('a','a@b.test','hello',now(),'1',now()+interval '90 days')");
  });
  await t.test("published snapshot must point to a real revision",async()=>{
    const item=(await pool.query("INSERT INTO content_items(content_type,created_by) VALUES('project',$1::uuid) RETURNING id",[ownerId])).rows[0].id;
    await assert.rejects(pool.query("INSERT INTO published_snapshots(item_id,source_revision_no,public_path,public_payload,published_by) VALUES($1::uuid,1,'/projects/nonexistent','{}'::jsonb,$2::uuid)",[item,ownerId]),err=>err.code==="23503");
  });
});
