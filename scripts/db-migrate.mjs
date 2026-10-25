import { studioPool, closeStudio } from "../server/studio/db.js";
import { applyStudioMigrations, assertStudioSchema } from "../server/studio/migrations.js";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required for the migration command.");
  process.exit(1);
}
try {
  const db = studioPool();
  await applyStudioMigrations(db);
  await assertStudioSchema(db);
  console.info("Portfolio Studio database schema V1 verified. Existing owner and published content preserved.");
} catch (error) {
  console.error("Studio migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeStudio();
}
