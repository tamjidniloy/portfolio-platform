import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { StudioError } from "./errors.js";

// Uploaded files live outside version control. Back up data/uploads together with PostgreSQL.
export function mediaDirectory() {
  return path.resolve(process.env.PORTFOLIO_UPLOAD_DIR || "data/uploads");
}

const fileType = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) return "png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
};

export async function uploadStudioImage(req, res) {
  if (!Buffer.isBuffer(req.body) || req.body.length < 16 || req.body.length > 5 * 1024 * 1024) throw new StudioError(422, "Upload a JPG, PNG or WebP image under 5 MB");
  const extension = fileType(req.body);
  if (!extension) throw new StudioError(422, "Unsupported image file contents");
  const filename = randomBytes(16).toString("hex") + "." + extension;
  await mkdir(mediaDirectory(), { recursive: true });
  await writeFile(path.join(mediaDirectory(), filename), req.body, { flag: "wx", mode: 0o644 });
  res.status(201).json({ url: "/media/" + filename });
}

export async function serveStudioImage(request, response) {
  const name = request.params.name;
  if (!/^[a-f0-9]{32}\.(png|jpg|webp)$/.test(name)) { response.status(404).end(); return; }
  try {
  const bytes = await readFile(path.join(mediaDirectory(), name));
    response.type(name.endsWith(".png") ? "image/png" : name.endsWith(".jpg") ? "image/jpeg" : "image/webp");
    response.set("Cache-Control", "public, max-age=31536000, immutable").send(bytes);
  } catch { response.status(404).end(); }
}
