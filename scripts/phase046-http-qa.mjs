import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";

const base=process.env.QA_BASE_URL||"http://127.0.0.1:3000";
const mode=process.env.QA_MODE||"disabled";
if(!["disabled","cms"].includes(mode))throw Error("QA_MODE must be disabled or cms");
const u=new URL(base);
if(!["127.0.0.1","localhost","::1"].includes(u.hostname)&&process.env.QA_ALLOW_REMOTE!=="true"){
 throw Error("Remote QA requires explicit QA_ALLOW_REMOTE=true and a separately approved read-only target");
}
const cases=[];
async function check(id,path,{status,method="GET",headers={},body,contains,excludes,cache=true}={}){
 const start=performance.now();
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const response=await fetch(new URL(path,base),{method,headers,body,redirect:"manual",signal:controller.signal});
  const content=await response.text();
  assert.equal(response.status,status,id+" status "+response.status);
  if(cache)assert.equal(response.headers.get("cache-control"),"no-store",id+" no-store");
  assert.equal(response.headers.get("x-frame-options"),"DENY",id+" frame protection");
  assert.equal(response.headers.get("x-content-type-options"),"nosniff",id+" nosniff");
  assert.ok(response.headers.get("x-request-id"),id+" request correlation");
  if(contains)assert.match(content,contains,id+" expected body");
  if(excludes)assert.doesNotMatch(content,excludes,id+" forbidden payload");
  assert.ok(content.length<2_000_000,id+" response bytes capped");
  cases.push({id,status:"PASS",http_status:status,duration_ms:Math.round(performance.now()-start)});
 }finally{clearTimeout(timeout);}
}
await check("P4-057-PUBLIC-SEMANTICS","/",{status:200,contains:/<html[^>]*lang="en"/,excludes:/PRIVATE_RESEARCH_CONTEXT/});
await check("P4-058-MISSING-NOT-200","/qa-nonexistent-unsafe-route",{status:404,excludes:/DATABASE_URL|postgresql:\/\/|STACK_TRACE|node_modules/});
await check("P4-058-OWNER-DENIED","/admin",{status:mode==="cms"?401:404,excludes:/csrfToken|webauthn_credentials|PRIVATE_RESEARCH_CONTEXT/});
await check("P4-058-OWNER-API-DENIED","/api/v1/admin/content",{status:mode==="cms"?401:404,excludes:/admin_sessions|privateNote|DATABASE_URL/});
await check("P4-058-LEGACY-PASSWORD-NOT-EXPOSED","/api/v1/auth/password",{status:404});
await check("P4-058-HEADERS","/healthz",{status:200,contains:/"status":"ok"/});
await check("P4-059-READY","/readyz",{status:200,contains:/"status":"ready"/});
await check("P4-060-CONTACT-PRIVACY","/privacy",{status:200,contains:/90 days|privacy/i});
await check("P4-060-LEGACY-WORK-REDIRECT","/work",{status:308,cache:false});
await check("P4-057-PROJECT-SSR","/projects",{status:200,contains:/<h1/});
await check("P4-057-RESEARCH-SSR","/research",{status:200,contains:/<h1/});
if(mode==="cms"){
 await check("P4-058-CMS-ANON-MUTATION","/api/v1/admin/content",{status:401,method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contentType:"project",payload:{title:"malicious"}})});
 await check("P4-058-CMS-INVALID-PAGINATION","/api/v1/public/projects?limit=99999",{status:422,contains:/Unprocessable|INVALID_PAGINATION/});
 await check("P4-058-CMS-INVALID-JSON","/api/v1/admin/content",{status:400,method:"POST",headers:{"Content-Type":"application/json"},body:'{"broken":',excludes:/SyntaxError|\n\s+at /});
 await check("P4-060-SITEMAP-PUBLISHED-ONLY","/sitemap.xml",{status:200,contains:/<urlset/,excludes:/PRIVATE_RESEARCH_CONTEXT|private-project|secret-new-slug/});
 await check("P4-058-PRIVATE-PREVIEW-DENIED","/api/v1/admin/content/00000000-0000-4000-8000-000000000000/preview",{status:401});
 await check("P4-058-PRIVATE-MEDIA-DENIED","/api/v1/admin/media",{status:401});
}
console.log(JSON.stringify({qa_mode:mode,total:cases.length,passed:cases.length,scope:"anonymous HTTP/SSR only; not authenticated browser/WebAuthn/WCAG/production",cases},null,2));
