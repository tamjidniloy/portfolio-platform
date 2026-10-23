import { existsSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const devEntry = require.resolve("@react-router/dev/package.json");
const root = devEntry.slice(0, -"package.json".length);
console.info("Node runtime:", process.version);
console.info("Resolved router development package:", devEntry);
console.info("module-sync-enabled file exists:", existsSync(new URL("module-sync-enabled/index.mjs", "file://" + root)));
