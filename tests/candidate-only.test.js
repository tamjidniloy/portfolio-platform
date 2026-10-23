import assert from "node:assert/strict";
import test from "node:test";
import { assertCandidateDatabase } from "../server/persistence/candidate-only.js";

test("candidate safety gate allows only dedicated local disposable databases", () => {
  assert.equal(assertCandidateDatabase("postgresql://a:b@127.0.0.1:5432/devfolio_candidate_ci","test"),true);
  for (const url of [
    undefined, "not-a-url", "postgresql://x:y@db.example.com/devfolio_candidate_ci",
    "postgresql://x:y@localhost/devfolio_dev",
    "postgresql://x:y@localhost/production",
    "https://localhost/devfolio_candidate_ci",
  ]) assert.throws(() => assertCandidateDatabase(url,"test"));
  assert.throws(() => assertCandidateDatabase("postgresql://x:y@localhost/devfolio_candidate_ci","production"));
});
