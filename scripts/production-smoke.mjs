import assert from "node:assert/strict";

// Read-only checks intended for the public site AFTER DNS/HTTPS provisioning.
const origin = process.argv[2];
if (!origin) throw new Error("Usage: npm run smoke:production -- https://your-domain.example");
const url = new URL(origin);
if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
  throw new Error("Supply the HTTPS origin only, with no path or query string");
}
async function get(path) {
  const res = await fetch(new URL(path,url), { redirect:"manual",signal:AbortSignal.timeout(12000),headers:{"User-Agent":"Devfolio-Production-Smoke/1.0"} });
  return res;
}
const health = await get("/healthz");
assert.equal(health.status,200,"Live server health check");
const readiness = await get("/readyz");
assert.equal(readiness.status,200,"Database and media must be ready");
const home = await get("/");
assert.equal(home.status,200,"Public portfolio SSR must render");
assert.equal(home.headers.get("x-frame-options"),"DENY");
const html = await home.text();
assert.match(html,/<html/);
assert.match(html,/\/admin\/login/);
const contentResponse = await get("/api/studio/public");
assert.equal(contentResponse.status,200);
const content = await contentResponse.json();
assert.notEqual(content.name,"Your Name","Replace the default name before public launch");
assert.ok(content.email || content.socials.some((item) => item.url),"Publish a real contact method before launch");
const anon = await get("/admin");
assert.equal(anon.status,302,"Anonymous editor must redirect");
const visitorSession = await get("/api/studio/session");
assert.equal(visitorSession.status,200);
assert.equal((await visitorSession.json()).authenticated,false);
const robots = await get("/robots.txt");
assert.equal(robots.status,200);
assert.ok(!(await robots.text()).includes("Disallow: /\n"),"Published portfolio should not be blocked from crawling");
const sitemap = await get("/sitemap.xml");
assert.equal(sitemap.status,200);
assert.match(await sitemap.text(),/urlset/);
const invalidMedia = await get("/media/not-an-image.jpg");
assert.equal(invalidMedia.status,404);
console.info("Production public checks passed: HTTPS SSR, readiness, admin protection, published contact, search metadata, media handling.");
console.info("Still verify owner OTP, contact delivery, actual uploads, restore drill, DNS and accessibility manually.");
