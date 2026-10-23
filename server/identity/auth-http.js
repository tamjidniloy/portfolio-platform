import express from "express";
import { createHash, randomBytes } from "node:crypto";
import { assertSameOrigin, verifyOwnerMutation, csrfTokenForSession } from "./csrf.js";
import {
  serializeSessionCookie, clearSessionCookie, readSessionCookie,
} from "./session-tokens.js";
import {
  resolveOwnerSession, revokeOwnerSession, revokeAllOwnerSessions,
} from "./session-store.js";
import {
  AuthFailure, assertRelyingParty, createAuthenticationChallenge, finishAuthentication,
  beginBootstrapRegistration, beginAdditionalRegistration, finishRegistration,
  ceremonyCookie, readCeremonyCookie,
} from "./webauthn-service.js";
import { withTransaction } from "../persistence/unit-of-work.js";

const sha=value=>createHash("sha256").update(value).digest();
const SESSION_WINDOW="15 minutes";
const MAX_BODY="24kb";
const safe=(fn)=>(req,res,next)=>Promise.resolve().then(()=>fn(req,res,next)).catch(next);
function replyError(res,error) {
  const status=error instanceof AuthFailure?error.status:500;
  res.status(status).set("Cache-Control","no-store").type("application/problem+json").json({
    type:"about:blank",title:status===429?"Too Many Requests":status===403?"Forbidden":status===500?"Server Error":"Unauthorized",
    status,detail:status===500?"Authentication unavailable":error.message,
    code:status===429?"RATE_LIMITED":status===500?"SERVER_ERROR":"AUTH_REJECTED",
  });
}
function sessionCookieClear(res,prod) {
  res.append("Set-Cookie",clearSessionCookie({isProduction:prod}));
}
function ceremony(res,token,prod) {res.append("Set-Cookie",ceremonyCookie(token,{production:prod}));}
function clearCeremony(res,prod) {res.append("Set-Cookie",ceremonyCookie(null,{production:prod,clear:true}));}
function authenticated(response,result,prod) {
  response.append("Set-Cookie",serializeSessionCookie(result.token,{isProduction:prod,maxAgeSeconds:3600}));
  response.status(200).json({authenticated:true,expiresAt:result.expiresAt});
}
async function verifiedOwner(pool,req,{publicOrigin,csrfSecret,production,recent=false}={}){
  const token=readSessionCookie(req.headers.cookie,{isProduction:production});
  const session=await resolveOwnerSession(pool,token);
  if(!session)throw new AuthFailure();
  const updated=await pool.query(
    `UPDATE admin_sessions SET last_seen_at=now()
     WHERE id=$1::uuid AND revoked_at IS NULL AND expires_at>now()
       AND coalesce(last_seen_at,issued_at)>now()-interval '15 minutes'
     RETURNING last_authenticated_at`,
    [session.sessionId],
  );
  if(!updated.rowCount)throw new AuthFailure();
  if(recent && new Date(updated.rows[0].last_authenticated_at).getTime() < Date.now()-10*60*1000)
    throw new AuthFailure("Recent passkey authentication required",403);
  if(!verifyOwnerMutation({method:req.method,origin:req.headers.origin,expectedOrigin:publicOrigin,
      sessionToken:token,csrfToken:req.headers["x-csrf-token"],secret:csrfSecret}))
    throw new AuthFailure("Origin or CSRF verification failed",403);
  return {session,token};
}
export function createOwnerAuthRouter({pool,publicOrigin,rpID,csrfSecret,isProduction=false}={}){
  if(!pool?.query || typeof csrfSecret!=="string" || Buffer.byteLength(csrfSecret)<32)
    throw new Error("Trusted owner authentication configuration required");
  const rp=assertRelyingParty({origin:publicOrigin,rpID});
  if(isProduction && !publicOrigin.startsWith("https://"))throw new Error("Owner login requires HTTPS");
  const router=express.Router();
  router.use(express.json({limit:MAX_BODY}));
  router.use((_req,res,next)=>{res.set("Cache-Control","no-store");next();});
  router.use((req,_res,next)=>{
    if(req.method!=="POST")return next();
    try{assertSameOrigin(req.headers.origin,publicOrigin);next();}catch{next(new AuthFailure("Origin required",403));}
  });
  router.post("/auth/passkey/options",safe(async(req,res)=>{
    const ipDigest=sha(String(req.ip)+"|"+csrfSecret).toString("hex");
    const data=await createAuthenticationChallenge(pool,{rpID:rp.rpID,clientIpDigest:ipDigest});
    ceremony(res,data.ceremonyToken,isProduction);
    res.status(200).json({challengeId:data.challengeId,publicKey:data.publicKey});
  }));
  router.post("/auth/passkey/verify",safe(async(req,res)=>{
    const token=readCeremonyCookie(req.headers.cookie,{production:isProduction});
    const session=await finishAuthentication(pool,{
      challengeId:req.body?.challengeId,ceremonyToken:token,response:req.body?.credential,
      origin:rp.origin,rpID:rp.rpID,
    });
    clearCeremony(res,isProduction);
    authenticated(res,session,isProduction);
  }));
  // Initial enrollment requires an offline one-use bootstrap token from CLI.
  router.post("/auth/bootstrap/options",safe(async(req,res)=>{
    const data=await beginBootstrapRegistration(pool,{
      bootstrapToken:req.body?.bootstrapToken,origin:rp.origin,rpID:rp.rpID,
    });
    ceremony(res,data.ceremonyToken,isProduction);
    res.json({challengeId:data.challengeId,publicKey:data.publicKey});
  }));
  router.post("/auth/bootstrap/verify",safe(async(req,res)=>{
    const result=await finishRegistration(pool,{
      challengeId:req.body?.challengeId,
      ceremonyToken:readCeremonyCookie(req.headers.cookie,{production:isProduction}),
      response:req.body?.credential,origin:rp.origin,rpID:rp.rpID,pendingOnly:true,
    });
    clearCeremony(res,isProduction);
    authenticated(res,result.session,isProduction);
  }));
  router.post("/auth/logout",safe(async(req,res)=>{
    const {token}=await verifiedOwner(pool,req,{publicOrigin:rp.origin,csrfSecret,production:isProduction});
    await revokeOwnerSession(pool,token);
    sessionCookieClear(res,isProduction);
    res.status(204).end();
  }));
  router.get("/admin/passkeys",safe(async(req,res)=>{
    const token=readSessionCookie(req.headers.cookie,{isProduction});
    const session=await resolveOwnerSession(pool,token);
    if(!session)throw new AuthFailure();
    const r=await pool.query(
      `SELECT id,device_label,created_at,last_used_at FROM webauthn_credentials
       WHERE admin_user_id=$1::uuid AND revoked_at IS NULL ORDER BY created_at DESC`,
      [session.ownerId],
    );
    res.json({items:r.rows.map(x=>({id:x.id,label:x.device_label,createdAt:x.created_at,lastUsedAt:x.last_used_at}))});
  }));
  router.post("/admin/passkeys/options",safe(async(req,res)=>{
    const {session}=await verifiedOwner(pool,req,{publicOrigin:rp.origin,csrfSecret,production:isProduction,recent:true});
    const data=await beginAdditionalRegistration(pool,{ownerId:session.ownerId,origin:rp.origin,rpID:rp.rpID});
    ceremony(res,data.ceremonyToken,isProduction);
    res.json({challengeId:data.challengeId,publicKey:data.publicKey});
  }));
  router.post("/admin/passkeys",safe(async(req,res)=>{
    const {session}=await verifiedOwner(pool,req,{publicOrigin:rp.origin,csrfSecret,production:isProduction,recent:true});
    const done=await finishRegistration(pool,{
      challengeId:req.body?.challengeId,
      ceremonyToken:readCeremonyCookie(req.headers.cookie,{production:isProduction}),
      response:req.body?.credential,origin:rp.origin,rpID:rp.rpID,ownerId:session.ownerId,
    });
    clearCeremony(res,isProduction);
    res.status(201).json({id:done.credentialId,createdAt:new Date()});
  }));
  router.delete("/admin/passkeys/:id",safe(async(req,res)=>{
    const {session}=await verifiedOwner(pool,req,{publicOrigin:rp.origin,csrfSecret,production:isProduction,recent:true});
    await withTransaction(pool,async client=>{
      const r=await client.query(
        "SELECT id FROM webauthn_credentials WHERE admin_user_id=$1::uuid AND revoked_at IS NULL FOR UPDATE",
        [session.ownerId],
      );
      if(r.rows.length<=1)throw new AuthFailure("At least one active passkey is required",409);
      const found=r.rows.some(x=>x.id===req.params.id);
      if(!found)throw new AuthFailure();
      await client.query("UPDATE webauthn_credentials SET revoked_at=now() WHERE id=$1::uuid AND admin_user_id=$2::uuid",[req.params.id,session.ownerId]);
    });
    res.status(204).end();
  }));
  router.get("/admin/sessions",safe(async(req,res)=>{
    const token=readSessionCookie(req.headers.cookie,{isProduction});
    const session=await resolveOwnerSession(pool,token);
    if(!session)throw new AuthFailure();
    const rows=await pool.query(
      "SELECT id,issued_at,expires_at FROM admin_sessions WHERE admin_user_id=$1::uuid AND revoked_at IS NULL AND expires_at>now() ORDER BY issued_at DESC",
      [session.ownerId],
    );
    res.json({items:rows.rows.map(row=>({id:row.id,issuedAt:row.issued_at,expiresAt:row.expires_at}))});
  }));
  router.delete("/admin/sessions/:id",safe(async(req,res)=>{
    const {session}=await verifiedOwner(pool,req,{publicOrigin:rp.origin,csrfSecret,production:isProduction});
    await pool.query(
      "UPDATE admin_sessions SET revoked_at=now() WHERE id=$1::uuid AND admin_user_id=$2::uuid",
      [req.params.id,session.ownerId],
    );
    res.status(204).end();
  }));
  router.post("/admin/recovery-codes/rotate",safe(async(req,res)=>{
    const {session}=await verifiedOwner(pool,req,{publicOrigin:rp.origin,csrfSecret,production:isProduction,recent:true});
    const codes=Array.from({length:10},()=>randomBytes(16).toString("base64url"));
    await withTransaction(pool,async client=>{
      await client.query("UPDATE recovery_codes SET revoked_at=now() WHERE admin_user_id=$1::uuid AND used_at IS NULL AND revoked_at IS NULL",[session.ownerId]);
      const batch=randomBytes(16).toString("hex");
      const uuid=[batch.slice(0,8),batch.slice(8,12),batch.slice(12,16),batch.slice(16,20),batch.slice(20)].join("-");
      for(const code of codes)await client.query(
        "INSERT INTO recovery_codes(admin_user_id,batch_id,code_digest) VALUES($1::uuid,$2::uuid,$3)",
        [session.ownerId,uuid,sha(code)],
      );
      await client.query(
        "INSERT INTO audit_events(actor_admin_id,action,target_kind) VALUES($1::uuid,'recovery_codes.rotated','admin_users')",
        [session.ownerId],
      );
    });
    res.json({codes,notice:"Save these codes offline now. Each code can be used once."});
  }));
  // Recovery codes prove possession of an offline secret but DO NOT create
  // full owner sessions or permit passkey enrollment without trusted operator recovery.
  router.post("/auth/recovery/start",safe(async(_req,res)=>{
    res.status(202).json({accepted:true});
  }));
  router.post("/auth/recovery/complete",safe(async(req,res)=>{
    const code=req.body?.recoveryCode;
    if(typeof code!=="string"||code.length<20||code.length>200)throw new AuthFailure();
    const used=await withTransaction(pool,async client=>{
      const r=await client.query(
        `UPDATE recovery_codes SET used_at=now() WHERE id=(
         SELECT id FROM recovery_codes WHERE code_digest=$1 AND used_at IS NULL AND revoked_at IS NULL
         ORDER BY issued_at LIMIT 1 FOR UPDATE) RETURNING admin_user_id`,
        [sha(code)],
      );
      if(r.rows.length!==1)throw new AuthFailure();
      await client.query(
        "INSERT INTO audit_events(actor_admin_id,action,target_kind) VALUES($1::uuid,'recovery_code.used','admin_users')",
        [r.rows[0].admin_user_id],
      );
      return true;
    });
    if(!used)throw new AuthFailure();
    res.json({status:"restricted_recovery",expiresAt:new Date(Date.now()+5*60_000),
      notice:"Recovery code accepted. A separate trusted operator verification is required before passkey reset."});
  }));
  router.use((err,req,res,next)=>{void req;void next;replyError(res,err);});
  return router;
}
