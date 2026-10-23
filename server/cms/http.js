import express from "express";
import { readSessionCookie } from "../identity/session-tokens.js";
import { resolveOwnerSession, assertVerifiedOwner } from "../identity/session-store.js";
import { csrfTokenForSession, verifyOwnerMutation } from "../identity/csrf.js";
import { CmsError, checkedUuid } from "../../domain/cms/content-contract.js";
import {
 createDraft, saveDraft, listDrafts, getDraft, listRevisions,
 previewRevision, publishRevision, unpublishRevision, restoreRevision,
} from "./service.js";
import { getPublicSnapshot, getPublicList } from "./public-reader.js";
import { getPrivateSiteSettings, updatePrivateSiteSettings } from "./settings.js";

function problem(response, error) {
  let status=error instanceof CmsError ? error.status : 500;
  if(error.name==="OwnerNotAuthorized")status=401;
  if(error.code==="23505")status=409;
  if(error.name==="SyntaxError" && error.type==="entity.parse.failed") status=400;
  if(error.type==="entity.too.large")status=413;
  const titles={400:"Bad Request",401:"Unauthorized",403:"Forbidden",404:"Not Found",409:"Conflict",412:"Precondition Failed",413:"Payload Too Large",422:"Unprocessable Content",428:"Precondition Required",500:"Internal Server Error"};
  response.status(status).type("application/problem+json").send({
    type:"about:blank",title:titles[status],status,
    code: status===500?"INTERNAL_ERROR":error.code||"REQUEST_REJECTED",
    detail: status===500?"The request could not be completed":error.message,
  });
}
function matchVersion(value) {
  if(typeof value!=="string")throw new CmsError("PRECONDITION_REQUIRED",428,"If-Match required");
  const match=/^"lock-v(0|[1-9]\d{0,14})"$/.exec(value);
  if(!match||!Number.isSafeInteger(Number(match[1]))) throw new CmsError("PRECONDITION_REQUIRED",428,"Valid strong If-Match required");
  return Number(match[1]);
}
function parseLimit(req) {
  const value=req.query.limit===undefined ? 20 : Number(req.query.limit);
  if(!Number.isInteger(value)||value<1||value>50)throw new CmsError("INVALID_PAGINATION",422,"limit must be 1-50");
  return value;
}
function parseOffset(req) {
  const value=req.query.cursor===undefined ? 0 : Number(req.query.cursor);
  if(!Number.isInteger(value)||value<0||value>10000) throw new CmsError("INVALID_PAGINATION",422,"Invalid cursor");
  return value;
}
function envelope(items, limit, offset) {
  return {items,nextCursor:items.length===limit ? String(offset+limit):null};
}
function json(response,result,status=200) {
  response.status(status).set("Cache-Control","no-store").json(result);
}
function guarded(fn) {
  return (req,res,next) => Promise.resolve().then(()=>fn(req,res,next)).catch(next);
}

/**
 * Private CMS HTTP routes cannot be enabled by merely supplying credentials:
 * the host must explicitly mount this router with an active approved DB-R1 pool,
 * an exact public origin and a high-entropy CSRF secret. Session issuance is
 * not exposed here; Phase 04.2 must first verify a real passkey.
 */
export function createCmsApiRouter({pool,publicOrigin,csrfSecret,isProduction=false}={}) {
  if(!pool||typeof pool.query!=="function"||typeof publicOrigin!=="string"||
     typeof csrfSecret!=="string"||Buffer.byteLength(csrfSecret)<32) {
    throw new TypeError("CMS router requires database, origin and strong CSRF configuration");
  }
  const origin=new URL(publicOrigin);
  if(!["http:","https:"].includes(origin.protocol) || (isProduction&&origin.protocol!=="https:")||
      origin.username||origin.password||origin.pathname!=="/"||origin.search||origin.hash) {
    throw new Error("Invalid public origin");
  }
  const r=express.Router();
  r.use(express.json({limit:"260kb",type:"application/json"}));
  r.use((_req,res,next)=>{
    res.set("Cache-Control","no-store");
    res.set("X-Content-Type-Options","nosniff");
    next();
  });
  r.get("/public/projects",guarded(async(req,res)=>{
    const limit=parseLimit(req),offset=parseOffset(req);
    const items=await getPublicList(pool,{type:"project",limit,offset});
    json(res,envelope(items,limit,offset));
  }));
  r.get("/public/projects/:slug",guarded(async(req,res)=>{
    const data=await getPublicSnapshot(pool,"/projects/"+req.params.slug);
    if(!data)throw new CmsError("NOT_FOUND",404,"Not found");
    json(res,data);
  }));
  r.get("/public/research",guarded(async(req,res)=>{
    const limit=parseLimit(req),offset=parseOffset(req);
    const items=await getPublicList(pool,{type:"research",limit,offset});
    json(res,envelope(items,limit,offset));
  }));
  r.get("/public/research/:slug",guarded(async(req,res)=>{
    const data=await getPublicSnapshot(pool,"/research/"+req.params.slug);
    if(!data)throw new CmsError("NOT_FOUND",404,"Not found");
    json(res,data);
  }));

  r.use("/admin",guarded(async(req,res,next)=>{ void res;
    const token=readSessionCookie(req.headers.cookie,{isProduction});
    const session=await resolveOwnerSession(pool,token);
    if(!session)throw new CmsError("AUTH_REQUIRED",401,"Authentication required");
    assertVerifiedOwner(session);
    // Enforce AUTH-R1 15 minute sliding idle window before updating last seen.
    const validated=await pool.query(
      `UPDATE admin_sessions SET last_seen_at=now()
       WHERE id=$1::uuid AND revoked_at IS NULL AND expires_at>now()
       AND coalesce(last_seen_at,issued_at)>now()-interval '15 minutes'
       RETURNING id`,
      [session.sessionId],
    );
    if(!validated.rowCount)throw new CmsError("AUTH_EXPIRED",401,"Session expired");
    if(["POST","PATCH","PUT","DELETE"].includes(req.method)){
      if(!verifyOwnerMutation({
        method:req.method,origin:req.headers.origin,expectedOrigin:origin.origin,
        sessionToken:token,csrfToken:req.headers["x-csrf-token"],secret:csrfSecret,
      })) throw new CmsError("CSRF_REJECTED",403,"Origin or CSRF check failed");
    }
    req.cmsSession=session;
    req.cmsToken=token;
    next();
  }));

  r.get("/admin/site-settings",guarded(async(req,res)=>{
    const data=await getPrivateSiteSettings(pool,req.cmsSession);
    res.set("ETag",`"lock-v${data.lockVersion}"`);
    json(res,data);
  }));
  r.patch("/admin/site-settings",guarded(async(req,res)=>{
    const data=await updatePrivateSiteSettings(pool,req.cmsSession,{
      expectedVersion:matchVersion(req.headers["if-match"]),
      settings:req.body?.settings,
    });
    res.set("ETag",`"lock-v${data.lockVersion}"`);
    json(res,data);
  }));
  r.get("/admin/session",guarded(async(req,res)=>{
    json(res,{ownerId:req.cmsSession.ownerId,expiresAt:new Date(req.cmsSession.expiresAtEpochMs),
      csrfToken:csrfTokenForSession(req.cmsToken,csrfSecret)});
  }));
  r.get("/admin/content",guarded(async(req,res)=>{
    const limit=parseLimit(req),offset=parseOffset(req);
    const items=await listDrafts(pool,req.cmsSession,{limit,offset});
    json(res,envelope(items,limit,offset));
  }));
  r.post("/admin/content",guarded(async(req,res)=>{
    const {contentType,payload}=req.body||{};
    const data=await createDraft(pool,req.cmsSession,{type:contentType,payload,key:req.headers["idempotency-key"]});
    json(res,data,201);
  }));
  r.get("/admin/content/:id",guarded(async(req,res)=>{
    const data=await getDraft(pool,req.cmsSession,checkedUuid(req.params.id));
    res.set("ETag",`"lock-v${data.lockVersion}"`);
    json(res,data);
  }));
  r.patch("/admin/content/:id",guarded(async(req,res)=>{
    const data=await saveDraft(pool,req.cmsSession,{
      id:req.params.id,expectedVersion:matchVersion(req.headers["if-match"]),
      payload:req.body?.payload,changeNote:req.body?.changeNote,
    });
    res.set("ETag",`"lock-v${data.lockVersion}"`);
    json(res,data);
  }));
  r.get("/admin/content/:id/revisions",guarded(async(req,res)=>{
    json(res,{items:await listRevisions(pool,req.cmsSession,req.params.id,{limit:parseLimit(req)})});
  }));
  r.get("/admin/content/:id/preview",guarded(async(req,res)=>{
    const draft=await getDraft(pool,req.cmsSession,req.params.id);
    const rev=req.query.revisionNo===undefined ? draft.latestRevisionNo : Number(req.query.revisionNo);
    const result=await previewRevision(pool,req.cmsSession,req.params.id,rev);
    res.set("X-Robots-Tag","noindex, nofollow");
    json(res,result);
  }));
  r.post("/admin/content/:id/publish",guarded(async(req,res)=>{
    const data=await publishRevision(pool,req.cmsSession,{
      id:req.params.id,revisionNo:req.body?.revisionNo,
      expectedVersion:matchVersion(req.headers["if-match"]),key:req.headers["idempotency-key"],
    });
    json(res,data);
  }));
  r.post("/admin/content/:id/unpublish",guarded(async(req,res)=>{
    const data=await unpublishRevision(pool,req.cmsSession,{
      id:req.params.id,expectedVersion:matchVersion(req.headers["if-match"]),
      key:req.headers["idempotency-key"],
    });
    json(res,data);
  }));
  r.post("/admin/content/:id/restore",guarded(async(req,res)=>{
    const data=await restoreRevision(pool,req.cmsSession,{
      id:req.params.id,revisionNo:req.body?.revisionNo,
      expectedVersion:matchVersion(req.headers["if-match"]),key:req.headers["idempotency-key"],
    });
    json(res,data,201);
  }));

  r.use((err,req,res,next)=>{ void req; void next; problem(res,err); });
  return r;
}
