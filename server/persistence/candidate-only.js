/**
 * A CANDIDATE test database must be an ephemeral, local database.
 * Never run unapproved Phase 03 DDL against normal development, staging
 * or production data. Deny by default.
 */
export function assertCandidateDatabase(urlString, nodeEnv = process.env.NODE_ENV) {
  if (nodeEnv === "production") throw new Error("Candidate schema cannot run in production");
  if (!urlString) throw new Error("Dedicated CANDIDATE_DATABASE_URL is required");
  let url;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid candidate database connection URL");
  }
  const path = url.pathname.slice(1);
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      !["127.0.0.1", "localhost", "::1", "[::1]"].includes(url.hostname) ||
      !/^devfolio_candidate_(test|ci|migration_ci)$/.test(path)) {
    throw new Error("Candidate schema restricted to explicitly named local disposable databases");
  }
  return true;
}
