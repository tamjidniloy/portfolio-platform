import assert from "node:assert/strict";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import test from "node:test";
import pg from "pg";
import express from "express";
import {
 assertRelyingParty, createAuthenticationChallenge, finishAuthentication,
 beginBootstrapRegistration, finishRegistration, readCeremonyCookie,
} from "../../server/identity/webauthn-service.js";
import { createOwnerAuthRouter } from "../../server/identity/auth-http.js";
import { createSessionForVerifiedOwner } from "../../server/identity/session-store.js";
import { csrfTokenForSession } from "../../server/identity/csrf.js";

const hash=value=>createHash("sha256").update(value).digest();
test("owner passkey ceremonies use durable single-use challenges and deny invalid assertions",async t=>{
 const url=process.env.AUTH_TEST_DATABASE_URL;
 if(process.env.NODE_ENV==="production"||typeof url!=="string")throw Error("Isolated WebAuthn CI DB required");
 const u=new URL(url);
 if(u.hostname!=="127.0.0.1"||u.pathname!=="/devfolio_release_auth_ci")throw Error("Auth test database must be disposable loopback");
 const pool=new pg.Pool({connectionString:url,max:4,connectionTimeoutMillis:3000});
 t.after(async()=>pool.end());
 await pool.query(await (await import("node:fs/promises")).readFile("db/migrations/0001_release1_schema.sql","utf8"));
 await pool.query(await (await import("node:fs/promises")).readFile("db/migrations/0003_auth_abuse_controls.sql","utf8"));
 assert.throws(()=>assertRelyingParty({origin:"https://evil.example",rpID:"portfolio.example"}));
 assert.equal(assertRelyingParty({origin:"http://127.0.0.1:3000",rpID:"127.0.0.1"}).rpID,"127.0.0.1");
 const email="pending-"+randomUUID()+"@invalid.test";
 const pending=(await pool.query("INSERT INTO admin_users(email,status) VALUES($1,'pending') RETURNING id",[email])).rows[0].id;
 const bootstrap=randomBytes(32).toString("base64url");
 const row=(await pool.query(
  `INSERT INTO auth_challenges(admin_user_id,purpose,challenge_digest,ceremony_digest,expires_at)
   VALUES($1::uuid,'register',$2,$3,now()+interval '15 minutes') RETURNING id`,
  [pending,hash(randomBytes(32)),hash(bootstrap)],
 )).rows[0].id;
 await assert.rejects(beginBootstrapRegistration(pool,{bootstrapToken:"invalid",origin:"http://127.0.0.1:3000",rpID:"127.0.0.1"}));
 const start=await beginBootstrapRegistration(pool,{bootstrapToken:bootstrap,origin:"http://127.0.0.1:3000",rpID:"127.0.0.1"});
 assert.equal(start.challengeId,row);
 assert.equal(start.publicKey.userVerification,undefined); // registration uses authenticatorSelection.userVerification
 assert.equal(start.publicKey.authenticatorSelection.userVerification,"required");
 assert.equal(start.publicKey.rp.id,"127.0.0.1");
 await assert.rejects(beginBootstrapRegistration(pool,{bootstrapToken:bootstrap,origin:"http://127.0.0.1:3000",rpID:"127.0.0.1"}));
 await assert.rejects(finishRegistration(pool,{
  challengeId:row,ceremonyToken:start.ceremonyToken,
  response:{id:"invalid",response:{clientDataJSON:"bad"}},
  origin:"http://127.0.0.1:3000",rpID:"127.0.0.1",pendingOnly:true,
 }));
 assert.equal((await pool.query("SELECT status FROM admin_users WHERE id=$1::uuid",[pending])).rows[0].status,"pending");
 const active=(await pool.query(
  "INSERT INTO admin_users(email,status) VALUES($1,'active') RETURNING id",
  ["active-"+randomUUID()+"@invalid.test"],
 )).rows[0].id;
 const ipDigest=randomBytes(32).toString("hex");
 const challenge=await createAuthenticationChallenge(pool,{rpID:"127.0.0.1",clientIpDigest:ipDigest});
 assert.equal(challenge.publicKey.userVerification,"required");
 assert.match(challenge.ceremonyToken,/^[A-Za-z0-9_-]{43}$/);
 await assert.rejects(finishAuthentication(pool,{challengeId:challenge.challengeId,
  ceremonyToken:challenge.ceremonyToken,
  response:{id:"bad",response:{clientDataJSON:"invalid"}},
  origin:"http://127.0.0.1:3000",rpID:"127.0.0.1",
 }));
 assert.equal((await pool.query("SELECT count(*)::int AS n FROM admin_sessions WHERE admin_user_id=$1::uuid",[active])).rows[0].n,0);
 const fakeOwner=await pool.query("SELECT id FROM admin_users WHERE id=$1::uuid",[active]);
 assert.equal(fakeOwner.rowCount,1);
 const app=express();
 const server=await new Promise(resolve=>{const s=app.listen(0,"127.0.0.1",()=>resolve(s));});
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 const origin="http://127.0.0.1:"+server.address().port;
 app.use("/api/v1",createOwnerAuthRouter({
  pool,publicOrigin:origin,rpID:"127.0.0.1",
  csrfSecret:"ci-auth-secret-very-long-unguessable-not-real-0000000000",
  isProduction:false,
 }));
 const fail=await fetch(origin+"/api/v1/auth/passkey/options",{
  method:"POST",headers:{"Content-Type":"application/json",Origin:"https://attacker.invalid"},body:"{}",
 });
 assert.equal(fail.status,403);
 const started=await fetch(origin+"/api/v1/auth/passkey/options",{
  method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:"{}",
 });
 assert.equal(started.status,200);
 assert.equal(readCeremonyCookie(started.headers.get("set-cookie"))!==null,true);
 const blocked=await fetch(origin+"/api/v1/admin/passkeys/options",{
  method:"POST",headers:{"Content-Type":"application/json",Origin:origin},body:"{}",
 });
 assert.equal(blocked.status,401);
 const synthetic=await createSessionForVerifiedOwner(pool,{ownerId:active});
 const csrf=csrfTokenForSession(synthetic.token,"ci-auth-secret-very-long-unguessable-not-real-0000000000");
 const ownerHeaders={
  "Content-Type":"application/json",Origin:origin,
  "X-CSRF-Token":csrf,Cookie:"devfolio_session="+synthetic.token,
 };
 const rotated=await fetch(origin+"/api/v1/admin/recovery-codes/rotate",{
  method:"POST",headers:ownerHeaders,body:"{}",
 });
 assert.equal(rotated.status,200);
 const codes=(await rotated.json()).codes;
 assert.equal(codes.length,10);
 assert.equal(new Set(codes).size,10);
 const redeemed=await fetch(origin+"/api/v1/auth/recovery/complete",{
  method:"POST",headers:{"Content-Type":"application/json",Origin:origin},
  body:JSON.stringify({recoveryCode:codes[0]}),
 });
 assert.equal(redeemed.status,200);
 const receipt=await redeemed.json();
 assert.equal(receipt.status,"restricted_recovery");
 assert.equal(redeemed.headers.get("set-cookie"),null,"recovery code alone must never grant session");
 const replay=await fetch(origin+"/api/v1/auth/recovery/complete",{
  method:"POST",headers:{"Content-Type":"application/json",Origin:origin},
  body:JSON.stringify({recoveryCode:codes[0]}),
 });
 assert.equal(replay.status,401);
 assert.equal((await pool.query("SELECT count(*)::int AS n FROM recovery_codes WHERE used_at IS NOT NULL")).rows[0].n,1);
});
