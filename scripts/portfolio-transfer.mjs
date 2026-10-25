import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { getStudioContent, studioPool, initializeStudio, closeStudio } from "../server/studio/db.js";
import { mediaDirectory } from "../server/studio/media.js";
import { validatePortfolio } from "../server/studio/content.js";

// A portable snapshot of PUBLIC portfolio content and its locally uploaded images.
// It deliberately EXCLUDES passwords, owner email, sessions, one-time codes and credentials.
const FORMAT = "DEVFOLIO_PORTFOLIO_BUNDLE_V1";
const IMAGE = /^[a-f0-9]{32}\.(png|jpg|webp)$/;
const MAX_BYTES = 55 * 1024 * 1024;
const usage = "Usage: npm run portfolio:export OR npm run portfolio:import -- <bundle.json> --confirm-empty-portfolio";

function imageNames(content) {
  const urls = [content.avatar, ...content.projects.map((project) => project.cover)];
  return [...new Set(urls.filter((value) => value?.startsWith("/media/")).map((value) => value.slice(7)))];
}

function imageMatches(bytes, filename) {
  const kind = filename.split(".").at(-1);
  if (kind === "jpg") return bytes.length >= 16 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (kind === "png") return bytes.length >= 16 && bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (kind === "webp") return bytes.length >= 16 && bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP";
  return false;
}

async function exportBundle() {
  const { content } = await getStudioContent();
  const images = {};
  let totalBytes = 0;
  for (const name of imageNames(content)) {
    if (!IMAGE.test(name)) throw new Error("Unexpected media reference in portfolio content");
    const bytes = await readFile(path.join(mediaDirectory(), name));
    totalBytes += bytes.length;
    if (totalBytes > MAX_BYTES) throw new Error("Bundle exceeds 55 MB; reduce images before exporting");
    images[name] = { data: bytes.toString("base64"), sha256: createHash("sha256").update(bytes).digest("hex") };
  }
  const directory = path.resolve("data/exports");
  await mkdir(directory, { recursive: true });
  const target = path.join(directory, "portfolio-export-" + new Date().toISOString().replace(/[:.]/g,"-") + ".json");
  const bundle = JSON.stringify({ format: FORMAT, exportedAt: new Date().toISOString(), content, images });
  await writeFile(target, bundle, { flag: "wx", mode: 0o600 });
  console.log("Public portfolio bundle saved:", target);
  console.log("Includes published content and", Object.keys(images).length, "uploaded images. Never includes owner credentials.");
  console.log("Keep this file safe until import is complete. It is excluded from Git.");
}

async function importBundle(file) {
  if (!process.argv.includes("--confirm-empty-portfolio")) throw new Error("Import requires --confirm-empty-portfolio");
  const target = path.resolve(file);
  const stats = await stat(target);
  if (stats.size > MAX_BYTES * 1.5) throw new Error("Bundle is too large.");
  const bundle = JSON.parse(await readFile(target, "utf8"));
  if (bundle?.format !== FORMAT || !bundle.images || typeof bundle.images !== "object" || Array.isArray(bundle.images)) {
    throw new Error("Unsupported portfolio bundle format");
  }
  const content = validatePortfolio(bundle.content);
  const entries = Object.entries(bundle.images);
  const expected = imageNames(content);
  if (entries.length !== expected.length || entries.length > 31) throw new Error("Bundle image references are inconsistent.");
  const imageBuffers = [];
  let totalBytes = 0;
  for (const [name, entry] of entries) {
    if (!IMAGE.test(name) || !expected.includes(name) || typeof entry?.data !== "string" || !/^[a-f0-9]{64}$/.test(entry.sha256)) {
      throw new Error("Invalid portfolio image metadata");
    }
    const bytes = Buffer.from(entry.data, "base64");
    totalBytes += bytes.length;
    if (bytes.length > 5*1024*1024 || totalBytes > MAX_BYTES || !imageMatches(bytes,name) ||
       createHash("sha256").update(bytes).digest("hex") !== entry.sha256) {
      throw new Error("Portfolio image failed integrity or size validation");
    }
    imageBuffers.push([name,bytes]);
  }
  const db = studioPool();
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query("SELECT payload, version FROM portfolio_studio_content WHERE id=1 FOR UPDATE");
    if (existing.rows[0]?.payload?.name !== "Your Name" || Number(existing.rows[0]?.version) !== 1) {
      throw new Error("Target is not an untouched starter portfolio. Import refused to protect published content.");
    }
    await mkdir(mediaDirectory(), { recursive: true });
    for (const [name, bytes] of imageBuffers) {
      const targetFile = path.join(mediaDirectory(),name);
      try {
        await writeFile(targetFile,bytes,{flag:"wx",mode:0o644});
      } catch (error) {
        if (error.code !== "EEXIST") throw error;
        const existingBytes = await readFile(targetFile);
        if (!existingBytes.equals(bytes)) throw new Error("Existing image filename has different contents");
      }
    }
    await client.query("UPDATE portfolio_studio_content SET payload=$1::jsonb,version=version+1,updated_at=now() WHERE id=1", [JSON.stringify(content)]);
    await client.query("COMMIT");
    console.log("Portfolio import completed. Published content and", imageBuffers.length, "images transferred; owner credentials unchanged.");
  } catch(error) {
    await client.query("ROLLBACK").catch(()=>{});
    throw error;
  } finally { client.release(); }
}

try {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL in the local environment or production service");
  const action = process.argv[2];
  if (action !== "export" && action !== "import") throw new Error(usage);
  await initializeStudio();
  if (action === "export") await exportBundle();
  else {
    if (!process.argv[3] || process.argv[3].startsWith("--")) throw new Error(usage);
    await importBundle(process.argv[3]);
  }
} catch(error) {
  console.error("Portfolio transfer failed:", error.message);
  process.exitCode = 1;
} finally {
  await closeStudio();
}
