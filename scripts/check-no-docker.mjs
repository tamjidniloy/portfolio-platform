import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const tracked = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
for (const path of tracked) {
  assert.ok(!/(^|\/)(compose\.ya?ml|Dockerfile|\.dockerignore)$/.test(path), `Container manifest: ${path}`);
}
for (const path of tracked.filter((value) => /^\.github\/workflows\/.*\.ya?ml$/.test(value))) {
  const contents = readFileSync(path, "utf8");
  assert.ok(!/^\s*services:\s*$/m.test(contents), `CI container services: ${path}`);
  assert.ok(!/docker\s+(build|run|pull|compose)/i.test(contents), `CI container invocation: ${path}`);
}
console.log("Checked Git-tracked manifests and active CI workflows: no container dependency.");
