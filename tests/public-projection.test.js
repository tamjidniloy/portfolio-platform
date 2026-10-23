import assert from "node:assert/strict";
import test from "node:test";
import { projectPublishedSnapshot, projectPublishedList } from "../domain/public-projection.js";

const safe = { visibility: "published", ownerApproved: true, slug: "real-work", title: "Verified title", summary: "Reviewed summary" };

test("published projection explicitly selects safe fields", () => {
  const projection = projectPublishedSnapshot({ ...safe, privateNotes: "SECRET", sessionToken: "TOP_SECRET", draft: { password: "NO" } });
  assert.deepEqual(projection, { slug: "real-work", title: "Verified title", summary: "Reviewed summary" });
  assert.ok(Object.isFrozen(projection));
  assert.equal(JSON.stringify(projection).includes("SECRET"), false);
});

test("unpublished/unapproved/invalid items never project publicly", () => {
  for (const candidate of [
    null, {}, { ...safe, visibility: "draft" }, { ...safe, ownerApproved: false },
    { ...safe, slug: "../admin" }, { ...safe, title: "" },
    { ...safe, title: "x".repeat(201) }, { ...safe, summary: "x".repeat(2001) },
  ]) {
    assert.equal(projectPublishedSnapshot(candidate), null);
  }
});

test("published collection excludes private and does not retain source keys", () => {
  const projected = projectPublishedList([{ ...safe, privateKey: "key" }, { ...safe, visibility: "draft" }]);
  assert.equal(projected.length, 1);
  assert.equal(projected[0].privateKey, undefined);
  assert.deepEqual(projectPublishedList("invalid"), []);
});
