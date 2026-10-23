import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { sweepRetention } from "../../server/persistence/retention.js";
test("privacy retention preview, legal hold and approved database deletion window",async t=>{
 const url=process.env.RETENTION_TEST_DATABASE_URL;
 if(!url||process.env.NODE_ENV==="production")throw Error("Isolated retention database required");
 const u=new URL(url);
 if(u.hostname!=="127.0.0.1"||u.pathname!=="/devfolio_retention_ci")throw Error("No real DB");
 const pool=new pg.Pool({connectionString:url,max:2});
 t.after(async()=>pool.end());
 const {readFile}=await import("node:fs/promises");
 for(const name of ["0001_release1_schema.sql","0004_contact_legal_hold.sql"]){
   await pool.query(await readFile("db/migrations/"+name,"utf8"));
 }
 await pool.query(
  `INSERT INTO contact_messages(sender_name,sender_email,message_body,consent_at,notice_version,created_at,retention_until)
   VALUES('Test','contact@example.test','delete',now()-interval '100 days','v1',now()-interval '100 days',now()-interval '10 days')`,
 );
 await pool.query(
  `INSERT INTO contact_messages(sender_name,sender_email,message_body,consent_at,notice_version,created_at,retention_until,legal_hold_until)
   VALUES('Test','held@example.test','retain',now()-interval '100 days','v1',now()-interval '100 days',now()-interval '10 days',now()+interval '20 days')`,
 );
 const preview=await sweepRetention(pool);
 assert.equal(preview.mode,"dry-run");
 assert.equal(preview.results.find(x=>x.table==="contact_messages").candidates,1);
 assert.equal((await pool.query("SELECT count(*)::int AS n FROM contact_messages")).rows[0].n,2);
 const applied=await sweepRetention(pool,{apply:true});
 assert.equal(applied.results.find(x=>x.table==="contact_messages").candidates,1);
 const left=await pool.query("SELECT sender_email FROM contact_messages");
 assert.deepEqual(left.rows.map(x=>x.sender_email),["held@example.test"]);
});
