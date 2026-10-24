import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PORTFOLIO, validatePortfolio } from "../server/studio/content.js";
import { makePasswordHash, matchesPassword, cookieToken } from "../server/studio/index.js";
import { allowedOrigin } from "../server/studio/auth.js";
import { mediaDirectory } from "../server/studio/media.js";

test("default portfolio satisfies the published content contract", () => {
  assert.deepEqual(validatePortfolio(DEFAULT_PORTFOLIO), DEFAULT_PORTFOLIO);
  assert.equal(DEFAULT_PORTFOLIO.projects.length, 0);
});

test("owner content cannot publish script URLs or forged upload paths", () => {
  const copy = structuredClone(DEFAULT_PORTFOLIO);
  copy.resumeUrl = "javascript:alert(1)";
  assert.throws(() => validatePortfolio(copy), /resumeUrl/);
  copy.resumeUrl = "";
  copy.avatar = "/admin/login";
  assert.throws(() => validatePortfolio(copy), /avatar/);
});

test("owner collections reject duplicate IDs and normalize skills", () => {
  const copy = structuredClone(DEFAULT_PORTFOLIO);
  copy.skills = ["React", "React", "TypeScript"];
  assert.deepEqual(validatePortfolio(copy).skills, ["React", "TypeScript"]);
  copy.projects = [
    {id:"repeat",title:"A",category:"",description:"",year:"",cover:"",stack:"",liveUrl:"",sourceUrl:"",featured:false},
    {id:"repeat",title:"B",category:"",description:"",year:"",cover:"",stack:"",liveUrl:"",sourceUrl:"",featured:false},
  ];
  assert.throws(() => validatePortfolio(copy), /projects.id/);
});

test("password hashing salts each password and rejects invalid credentials", async () => {
  const first = await makePasswordHash("an-example-owner-password-123");
  const second = await makePasswordHash("an-example-owner-password-123");
  assert.notEqual(first, second);
  assert.equal(await matchesPassword("an-example-owner-password-123", first), true);
  assert.equal(await matchesPassword("not-the-password", first), false);
  await assert.rejects(makePasswordHash("too-short"), /12/);
});

test("sessions parse both Express and React Router cookies and reject duplicates", () => {
  const value = "a".repeat(43);
  const cookie = "theme=dark; portfolio_owner=" + value;
  assert.equal(cookieToken({headers:{cookie}}), value);
  assert.equal(cookieToken(new Request("http://127.0.0.1:3000/admin", {headers:{cookie}})), value);
  assert.equal(cookieToken({headers:{cookie:cookie+"; portfolio_owner="+value}}), "");
  assert.equal(cookieToken({headers:{cookie:"portfolio_owner=invalid"}}), "");
});

test("state-changing requests accept only explicitly configured first-party origins", () => {
  const previous = process.env.PORTFOLIO_PUBLIC_ORIGIN;
  const mode = process.env.NODE_ENV;
  try {
    process.env.PORTFOLIO_PUBLIC_ORIGIN = "https://portfolio.example.test";
    process.env.NODE_ENV = "production";
    const request = (origin, site) => ({
      headers: { origin },
      get: (name) => name === "sec-fetch-site" ? site : undefined,
    });
    assert.equal(allowedOrigin(request("https://portfolio.example.test", "same-origin")), true);
    assert.equal(allowedOrigin(request("https://evil.example.test", "cross-site")), false);
    assert.equal(allowedOrigin(request("http://127.0.0.1:3000", "same-origin")), false);
  } finally {
    if (previous === undefined) delete process.env.PORTFOLIO_PUBLIC_ORIGIN;
    else process.env.PORTFOLIO_PUBLIC_ORIGIN = previous;
    if (mode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = mode;
  }
});

test("media storage defaults to an ignored data directory", () => {
  const previous = process.env.PORTFOLIO_UPLOAD_DIR;
  try {
    delete process.env.PORTFOLIO_UPLOAD_DIR;
    assert.match(mediaDirectory().replaceAll("\\", "/"), /\/data\/uploads$/);
  } finally {
    if (previous !== undefined) process.env.PORTFOLIO_UPLOAD_DIR = previous;
  }
});
