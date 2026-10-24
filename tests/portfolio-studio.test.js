import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PORTFOLIO, validatePortfolio } from "../server/studio/content.js";
import { makePasswordHash, matchesPassword, cookieToken } from "../server/studio/index.js";

test("starter content is safe for public rendering", () => {
  const result = validatePortfolio(DEFAULT_PORTFOLIO);
  assert.equal(result.name, "Your Name");
  assert.deepEqual(result.projects, []);
  assert.deepEqual(result.skills, []);
});
test("the editor accepts structured portfolio collections", () => {
  const input = structuredClone(DEFAULT_PORTFOLIO);
  input.name = "Sample Person";
  input.skills = ["React", "TypeScript"];
  input.projects = [{
    id: "project_1", title: "Selected build", category: "Web",
    description: "Description", year: "2026", cover: "/media/" + "a".repeat(32) + ".png",
    stack: "React", liveUrl: "https://example.com", sourceUrl: "", featured: true,
  }];
  const result = validatePortfolio(input);
  assert.equal(result.projects[0].featured, true);
  assert.equal(result.skills.length, 2);
});
test("rejects unsafe links and invalid image references", () => {
  const input = structuredClone(DEFAULT_PORTFOLIO);
  input.resumeUrl = "javascript:alert(1)";
  assert.throws(() => validatePortfolio(input), /resumeUrl/);
  input.resumeUrl = "";
  input.avatar = "/admin/security";
  assert.throws(() => validatePortfolio(input), /avatar/);
});
test("rejects duplicates, bad email and oversized content", () => {
  const input = structuredClone(DEFAULT_PORTFOLIO);
  input.email = "invalid-email";
  assert.throws(() => validatePortfolio(input), /email/);
  input.email = "";
  input.skills = ["A", "A"];
  assert.deepEqual(validatePortfolio(input).skills, ["A"]);
  input.projects = [{id:"same",title:"A",category:"",description:"",year:"",cover:"",stack:"",liveUrl:"",sourceUrl:"",featured:false}];
  input.projects.push({ ...input.projects[0] });
  assert.throws(() => validatePortfolio(input), /projects.id/);
});
test("passwords are salted, hashed and verified safely", async () => {
  const first = await makePasswordHash("correct-horse-battery-staple");
  const second = await makePasswordHash("correct-horse-battery-staple");
  assert.notEqual(first, second);
  assert.equal(await matchesPassword("correct-horse-battery-staple", first), true);
  assert.equal(await matchesPassword("wrong-password", first), false);
  await assert.rejects(makePasswordHash("short"), /Password must/);
});

test("owner session cookies are parsed in React Router SSR and Express HTTP requests", () => {
  const token = "a".repeat(43);
  const value = "visitor=ok; portfolio_owner=" + token;
  const expressRequest = { headers: { cookie: value } };
  const ssrRequest = new Request("http://127.0.0.1:3000/admin", { headers: { cookie: value } });
  assert.equal(cookieToken(expressRequest), token);
  assert.equal(cookieToken(ssrRequest), token);
  assert.equal(cookieToken(new Request("http://127.0.0.1:3000/admin")), "");
  assert.equal(cookieToken({headers: { cookie: "portfolio_owner=invalid" }}), "");
  assert.equal(cookieToken({headers: { cookie: value + "; portfolio_owner=" + token }}), "");
  assert.equal(cookieToken({headers: { cookie: "not_portfolio_owner=" + token }}), "");
});
