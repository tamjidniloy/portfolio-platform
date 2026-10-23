import { projectPublicRevision } from "../../domain/cms/content-contract.js";

// ALL public queries touch ONLY published_snapshots. No draft join or actor table.
const publicPath = /^\/[a-z0-9]+(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
const whitelist = new Set(["project", "research", "article"]);
export function safePublicDto(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
  try {
    const { publicPayload } = projectPublicRevision(payload.contentType, payload);
    return publicPayload;
  } catch { return null; }
}
export async function getPublicSnapshot(pool, path) {
  if (typeof path !== "string" || path.length > 512 || !publicPath.test(path)) return null;
  const r = await pool.query("SELECT public_payload, published_at FROM published_snapshots WHERE public_path=$1 LIMIT 1",[path]);
  if (!r.rows.length) return null;
  const dto = safePublicDto(r.rows[0].public_payload);
  return dto ? Object.freeze({ ...dto, publishedAt: r.rows[0].published_at }) : null;
}
export async function getPublicList(pool, { type, limit = 20, offset = 0 } = {}) {
  if (!whitelist.has(type)) throw new TypeError("Unsupported public list type");
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 ||
      !Number.isInteger(offset) || offset < 0 || offset > 10000) {
    throw new RangeError("Invalid list pagination");
  }
  const base = { project: "/projects/", research: "/research/", article: "/writing/" }[type];
  const rows = await pool.query(
    "SELECT public_payload, published_at FROM published_snapshots WHERE left(public_path,length($1))=$1 ORDER BY published_at DESC, item_id ASC LIMIT $2 OFFSET $3",
    [base, limit, offset],
  );
  return Object.freeze(rows.rows.map(row => {
    const dto = safePublicDto(row.public_payload);
    return dto?.contentType === type ? Object.freeze({ ...dto, publishedAt: row.published_at }) : null;
  }).filter(Boolean));
}
export async function publishedSitemapPaths(pool) {
  const r=await pool.query("SELECT public_path FROM published_snapshots ORDER BY public_path");
  return Object.freeze(r.rows.map(x=>x.public_path).filter(x=>typeof x==="string"&&publicPath.test(x)));
}
