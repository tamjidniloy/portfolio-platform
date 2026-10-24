import assert from "node:assert/strict";

const origin=process.env.CMS_SMOKE_URL||"http://127.0.0.1:3001";
async function request(path,options) {
  const response=await fetch(new URL(path,origin),options);
  return {response,body:await response.text()};
}
const home=await request("/");
assert.equal(home.response.status,200);
assert.match(home.body,/<html/);
const listing=await request("/research");
assert.equal(listing.response.status,200);
assert.match(listing.body,/Scientific methods/);
assert.match(listing.body,/in progress/);
const detail=await request("/research/science-demo");
assert.equal(detail.response.status,200);
assert.match(detail.body,/Validated outcome/);
assert.doesNotMatch(detail.body,/PRIVATE_RESEARCH_CONTEXT/);
const publicApi=await request("/api/v1/public/research/science-demo");
assert.equal(publicApi.response.status,200);
const dto=JSON.parse(publicApi.body);
assert.equal(dto.researchStatus,"in_progress");
assert.equal(dto.privateNote,undefined);
const publicSite=await request("/api/v1/public/site");
assert.equal(publicSite.response.status,200);
assert.equal(typeof JSON.parse(publicSite.body).title,"string");
const sitemap=await request("/sitemap.xml");
assert.equal(sitemap.response.status,200);
assert.match(sitemap.body,/https:\/\/portfolio\.example\.test\/research\/science-demo/);
assert.doesNotMatch(sitemap.body,/private-project|secret-new-slug|PRIVATE_RESEARCH_CONTEXT/);
const owner=await request("/admin",{redirect:"manual"});
assert.equal(owner.response.status,302,"Private studio redirects anonymous visitors to login");
assert.equal(owner.response.headers.get("location"),"/admin/login");
const ownerApi=await request("/api/v1/admin/content");
assert.equal(ownerApi.response.status,401);
const anonymousMutation=await request("/api/v1/admin/content",{
  method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify({contentType:"project",payload:{title:"attack"}}),
});
assert.equal(anonymousMutation.response.status,401);
const ownerLogin=await request("/admin/login");
assert.equal(ownerLogin.response.status,200,"Public owner sign-in page remains available");
assert.match(ownerLogin.body,/Welcome back/);
console.log("CMS-enabled SSR, public data, sitemap and anonymous auth-denial smoke PASS");

const robots=await request("/robots.txt");
assert.equal(robots.response.status,200);
assert.match(robots.body,/Disallow: \/admin/);
const contactDenied=await request("/api/v1/contact",{
  method:"POST",headers:{"Content-Type":"application/json",Origin:"http://127.0.0.1:3001"},
  body:JSON.stringify({name:"Test",email:"test@example.com",message:"Test"}),
});
assert.notEqual(contactDenied.response.status,202,"Disabled contact intake must never store a message");
const mediaDenied=await request("/api/v1/admin/media");
assert.equal(mediaDenied.response.status,401);
