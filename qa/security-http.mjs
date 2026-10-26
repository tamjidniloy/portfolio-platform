import assert from "node:assert/strict";

// Read-only / deliberately invalid requests; safe only for the disposable CI
// environment. Never send load / mutation probes to a public production domain.
const base = process.env.SMOKE_URL || "http://127.0.0.1:3000";
if (new URL(base).hostname !== "127.0.0.1" || process.env.CI !== "true") {
  throw new Error("Security negative-path tests require production-mode CI on loopback.");
}
const origin = new URL(base).origin;
const request = (path,init={}) => fetch(new URL(path,base),{redirect:"manual",signal:AbortSignal.timeout(10000),...init});
async function assertStatus(path, status, init, label) {
  const response = await request(path,init);
  assert.equal(response.status,status,label);
  const body = await response.text();
  assert.ok(!body.includes("ci-only-not-for-deployment-64-character"),"No secrets in API errors");
  return {response,body};
}

const home = (await assertStatus("/",200,undefined,"SSR is available")).response;
for (const [name,expected] of [
  ["x-frame-options","DENY"],["x-content-type-options","nosniff"],
  ["referrer-policy","strict-origin-when-cross-origin"],
  ["cross-origin-opener-policy","same-origin"],
]) assert.equal(home.headers.get(name),expected,"Missing security response header: "+name);
assert.match(home.headers.get("content-security-policy")||"",/frame-ancestors 'none'/);
assert.match(home.headers.get("strict-transport-security")||"",/max-age=31536000/);
assert.equal(home.headers.get("cache-control"),"no-store","No personalized HTML should be cached");
assert.match(home.headers.get("x-request-id")||"",/^[0-9a-f-]{36}$/i);

const publicResponse = await request("/api/studio/public");
assert.equal(publicResponse.status,200);
const publicData = await publicResponse.json();
for(const property of ["name","title","projects","skills","education","experience"]) assert.ok(property in publicData);
assert.equal("password_hash" in publicData,false,"No owner password field in public payload");
assert.equal("PORTFOLIO_AUTH_SECRET" in publicData,false);

const anonymousAdmin=await assertStatus("/admin",302,undefined,"Anonymous Studio is protected");
assert.equal(anonymousAdmin.response.headers.get("location"),"/admin/login");
await assertStatus("/api/studio/content",401,{
  method:"PUT",headers:{Origin:origin,"X-Studio-Request":"1","Content-Type":"application/json"},
  body:JSON.stringify({content:publicData,version:1}),
},"Anonymous publishing is denied");
await assertStatus("/api/studio/logout",401,{
  method:"POST",headers:{Origin:origin,"X-Studio-Request":"1","Content-Type":"application/json"},body:"{}"
},"Anonymous logout cannot mutate session");

await assertStatus("/api/studio/contact",403,{
  method:"POST",headers:{Origin:"https://malicious.example.test","X-Studio-Request":"1","Content-Type":"application/json"},
  body:"{}",
},"Offsite contact origin rejected");
await assertStatus("/api/studio/contact",403,{
  method:"POST",headers:{Origin:origin,"Content-Type":"application/json"},body:"{}",
},"Missing intent header rejected");
await assertStatus("/api/studio/contact",422,{
  method:"POST",headers:{Origin:origin,"X-Studio-Request":"1","Content-Type":"application/json"},
  body:JSON.stringify({name:"A",email:"invalid",subject:"No",message:"short",consent:false}),
},"Malformed enquiry rejected before email provider request");
await assertStatus("/api/studio/contact",422,{
  method:"POST",headers:{Origin:origin,"X-Studio-Request":"1","Content-Type":"application/json"},
  body:JSON.stringify({name:"Anonymous Sender",email:"sender@example.test",subject:"Valid subject",
    message:"This is a valid-looking request but it has no consent checkbox.",consent:false}),
},"Mandatory privacy consent enforced");
await assertStatus("/api/studio/contact",413,{
  method:"POST",headers:{Origin:origin,"X-Studio-Request":"1","Content-Type":"application/json"},
  body:JSON.stringify({name:"A",message:"a".repeat(11000)}),
},"Oversized enquiry rejected");
for(const path of [
  "/media/../../.env",
  "/media/%2E%2E%2F.env",
  "/media/00000000000000000000000000000000.svg",
  "/media/invalid-file.jpg",
  "/.env",
]) {
  const response = await request(path);
  assert.ok([403,404].includes(response.status),"Sensitive media path must not resolve: "+path);
}
const session = await request("/api/studio/session");
assert.equal((await session.json()).authenticated,false);
const missing = await request("/projects/non-existing-qa-project");
assert.equal(missing.status,404,"Unknown case study returns real 404");
const privacy = await request("/privacy");
assert.equal(privacy.status,200);
assert.match(await privacy.text(),/privacy/i);
console.info("SQA security HTTP: response headers, anonymous authorization, CSRF, consent, body limits, media paths and privacy passed.");
