import { readConfig } from "../server/config.js";
import { createDatabaseReadiness } from "../server/database.js";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  console.error("Node.js 22.12+ is required. Select Node 22 in WebStorm.");
  process.exitCode = 1;
} else {
  console.log(`Node.js version supported: ${process.version}`);
}

let config;
try {
  config = readConfig(process.env);
} catch {
  console.error("Invalid project environment settings. Review .env.example and your private .env.");
  process.exitCode = 1;
}

if (config) {
  if (!config.databaseUrl) {
    console.error("DATABASE_URL is missing. Copy .env.example to .env, then configure local PostgreSQL.");
    process.exitCode = 1;
  } else {
    const database = createDatabaseReadiness(config.databaseUrl);
    try {
      if (await database.check()) {
        console.log("Native PostgreSQL connection: OK.");
      } else {
        console.error("Native PostgreSQL connection: unavailable.");
        process.exitCode = 1;
      }
    } catch {
      console.error("Native PostgreSQL connection failed. Check Windows Services, role, port and URL encoding. Credentials are not printed.");
      process.exitCode = 1;
    } finally {
      await database.close();
    }
  }
}
