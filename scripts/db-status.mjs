import { studioPool, closeStudio } from "../server/studio/db.js";
import { assertStudioSchema } from "../server/studio/migrations.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}
try {
  const db = studioPool();
  await assertStudioSchema(db);
  const result = await db.query("SELECT (SELECT count(*)::integer FROM portfolio_studio_owner) AS owners, (SELECT count(*)::integer FROM portfolio_studio_content) AS portfolios");
  console.info("Database ready: schema v1; owners:", result.rows[0].owners, "portfolio records:", result.rows[0].portfolios);
} catch (error) {
  console.error("Database not ready:", error.message);
  process.exitCode = 1;
} finally { await closeStudio(); }
