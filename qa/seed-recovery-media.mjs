import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mediaDirectory } from "../server/studio/media.js";

// Only on disposable GitHub CI. Never writes to local owner's media directory.
assert.equal(process.env.CI,"true");
assert.equal(process.env.PORTFOLIO_UPLOAD_DIR,"/tmp/devfolio-ci-uploads");
const root=mediaDirectory();
await mkdir(root,{recursive:true});
const onePixelPng=Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Iu8AAAAASUVORK5CYII=",
  "base64");
assert.equal(onePixelPng.subarray(0,8).toString("hex"),"89504e470d0a1a0a");
for(const letter of ["a","b"]) {
  const name=letter.repeat(32)+".png";
  await writeFile(join(root,name),onePixelPng,{flag:"wx"});
}
console.info("Disposable SQA media prepared: before/after transformation assets");
