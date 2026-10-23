import assert from "node:assert/strict";
import test from "node:test";
import { getPublicSection, primaryNavigation, secondaryNavigation } from "../app/features/public-pages/sections.js";

test("only approved section slugs are routable", () => {
  for (const slug of ["work", "research", "about", "contact", "experience", "education", "skills", "achievements"]) {
    assert.equal(getPublicSection(slug)?.slug, slug);
  }
  assert.equal(getPublicSection("admin"), null);
  assert.equal(getPublicSection("writing"), null); // Optional, hide until approved content is present.
  assert.equal(getPublicSection("__proto__"), null);
});

test("approved navigation groups remain distinct", () => {
  assert.deepEqual(primaryNavigation.map((entry) => entry.slug), ["work", "research", "about", "contact"]);
  assert.deepEqual(secondaryNavigation.map((entry) => entry.slug), ["experience", "education", "skills", "achievements"]);
});
