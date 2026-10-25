import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_PORTFOLIO, validatePortfolio } from "../server/studio/content.js";

function project(fields = {}) {
  return {
    id: "case-study-1",
    title: "A documented product",
    category: "Engineering",
    description: "A genuine example of professional work.",
    year: "2026", cover: "", stack: "React, Node.js", liveUrl: "",
    sourceUrl: "", featured: true, ...fields,
  };
}

test("existing project content remains valid and case study fields default to empty", () => {
  const data = structuredClone(DEFAULT_PORTFOLIO);
  data.projects = [project()];
  const result = validatePortfolio(data);
  assert.equal(result.projects[0].role, "");
  assert.equal(result.projects[0].challenge, "");
  assert.equal(result.projects[0].approach, "");
  assert.equal(result.projects[0].architecture, "");
  assert.equal(result.projects[0].lessons, "");
  assert.equal(result.projects[0].beforeCover, "");
  assert.equal(result.projects[0].afterCover, "");
});

test("owner can publish authentic X-Ray experience, engineering and impact details", () => {
  const data = structuredClone(DEFAULT_PORTFOLIO);
  data.projects = [project({
    role: "Design engineering and quality assurance",
    challenge: "Make a complex interface usable on small screens.",
    approach: "Prioritized accessible progressive disclosure.",
    architecture: "SSR routes backed by an authorized publishing service.",
    outcome: "Fewer steps in the critical user journey.",
    lessons: "Test with different assistive technologies.",
  })];
  const result = validatePortfolio(data).projects[0];
  assert.match(result.architecture, /SSR routes/);
  assert.match(result.lessons, /assistive technologies/);
  assert.match(result.outcome, /Fewer steps/);
});

test("case study narrative is bounded and cannot bypass input validation", () => {
  const data = structuredClone(DEFAULT_PORTFOLIO);
  data.projects = [project({ architecture: "x".repeat(1801) })];
  assert.throws(() => validatePortfolio(data), /project.architecture/);
  data.projects[0].architecture = "";
  data.projects[0].role = ["not valid"];
  assert.throws(() => validatePortfolio(data), /project.role/);
});

test("transformation comparison images respect the existing image safety contract", () => {
  const data = structuredClone(DEFAULT_PORTFOLIO);
  data.projects = [project({ beforeCover: "/media/" + "a".repeat(32) + ".webp",
    afterCover: "https://images.example.test/result.webp" })];
  const normalized = validatePortfolio(data).projects[0];
  assert.match(normalized.beforeCover, /^\\/media\\//);
  assert.equal(normalized.afterCover, "https://images.example.test/result.webp");
  data.projects[0].afterCover = "/admin/login";
  assert.throws(() => validatePortfolio(data), /project.afterCover/);
  data.projects[0].afterCover = "javascript:alert(1)";
  assert.throws(() => validatePortfolio(data), /project.afterCover/);
});
