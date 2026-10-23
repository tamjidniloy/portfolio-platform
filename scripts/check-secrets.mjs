import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const paths = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const leakedEnvFiles = paths.filter(
  (path) => /(^|\/)\.env(?:\..+)?$/.test(path) && !path.endsWith(".env.example"),
);

const runtimeFiles = paths.filter((path) =>
  /^(app\/|server\/|scripts\/|tests\/|\.github\/workflows\/|server\.js$)/.test(path),
);

const signatures = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /AKIA[0-9A-Z]{16}/,
];

const findings = [...leakedEnvFiles.map((path) => `Disallowed environment file: ${path}`)];
for (const path of runtimeFiles) {
  const content = readFileSync(path, "utf8");
  if (signatures.some((signature) => signature.test(content))) {
    findings.push(`Possible secret signature: ${path}`);
  }
}

if (findings.length > 0) {
  for (const finding of findings) console.error(finding);
  process.exitCode = 1;
} else {
  console.log(`No matching signatures in ${runtimeFiles.length} runtime files; heuristic scan only.`);
}
