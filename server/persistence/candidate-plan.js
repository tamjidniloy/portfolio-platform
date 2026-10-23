import { readFile } from "node:fs/promises";

export const CANDIDATE_BASELINE_ID = "0001_phase03_proposed_baseline";

export async function loadCandidateMigrationPlan() {
  const sql = await readFile(
    new URL("../../db/candidate_migrations/0001_phase03_proposed_baseline.sql", import.meta.url),
    "utf8",
  );
  return [{ id: CANDIDATE_BASELINE_ID, sql }];
}
