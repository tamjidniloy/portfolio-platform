import test from "node:test";
import assert from "node:assert/strict";
import { contrastRatio, relativeLuminance, wcagContrastLevel } from "../app/lib/contrast.js";

test("WCAG contrast matches known extremes", () => {
  assert.equal(relativeLuminance("#000000"), 0);
  assert.equal(relativeLuminance("#FFFFFF"), 1);
  assert.equal(contrastRatio("#000000", "#FFFFFF"), 21);
  assert.equal(contrastRatio("#FFFFFF", "#000000"), 21);
  assert.equal(contrastRatio("#123456", "#123456"), 1);
});

test("WCAG AA thresholds distinguish normal and large text", () => {
  assert.deepEqual(wcagContrastLevel(3.2), { normalAA: false, largeAA: true, normalAAA: false });
  assert.deepEqual(wcagContrastLevel(4.5), { normalAA: true, largeAA: true, normalAAA: false });
  assert.deepEqual(wcagContrastLevel(7), { normalAA: true, largeAA: true, normalAAA: true });
});

test("hex color parsing rejects invalid input", () => {
  assert.throws(() => contrastRatio("#12", "#FFFFFF"), /six-digit/);
  assert.throws(() => relativeLuminance("red"), /six-digit/);
});
