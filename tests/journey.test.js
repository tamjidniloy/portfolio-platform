import test from "node:test";
import assert from "node:assert/strict";
import { chronologicalJourney, yearFromPeriod } from "../app/lib/journey.js";

test("mixed work and education are ordered by the earliest year in their recorded period", () => {
  const experience = [
    { id: "later", role: "Software Engineer", period: "2025-2026", description: "Work" },
    { id: "earlier", role: "Intern", period: "2021 – 2022", description: "Work" },
  ];
  const education = [{ id: "degree", degree: "BSc in CSE", period: "2023 – 2027", description: "Education" }];
  const records = chronologicalJourney(experience, education);
  assert.deepEqual(records.map(({id})=>id), ["earlier","degree","later"]);
  assert.deepEqual(records.map(({kind})=>kind), ["experience","education","experience"]);
});

test("period labels remain untouched; missing dates are sorted last without invention", () => {
  const records = chronologicalJourney(
    [{id:"open",period:"Current",role:"Designer"},{id:"year",period:"May 2025–Present",role:"Engineer"}],
    [{id:"undated",period:"To be announced",degree:"Course"}],
  );
  assert.deepEqual(records.map(r=>r.id),["year","undated","open"]);
  assert.equal(records[0].period,"May 2025–Present");
  assert.equal(records[1].startYear,null);
  assert.equal(yearFromPeriod("2023-2027"),2023);
  assert.equal(yearFromPeriod("Present"),null);
});
