/**
 * Candidate public-only read adapter. It never imports or queries private
 * revisions, owner sessions, contacts or raw content_items.
 * This module is not wired to routes until DB/API owner signoff.
 */
const PATH_PATTERN = /^\/[a-z0-9]+(?:[a-z0-9/-]*[a-z0-9])?$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isPublicPath(path) {
  return typeof path === "string" && path.length <= 512 &&
    PATH_PATTERN.test(path) && !path.includes("//");
}

export function toPublicDto(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { slug, title, summary } = value;
  if (typeof slug !== "string" || slug.length > 160 || !SLUG_PATTERN.test(slug)) return null;
  if (typeof title !== "string" || !title.trim() || title.length > 200) return null;
  if (typeof summary !== "string" || summary.length > 2000) return null;
  // Privacy boundary: do not spread JSONB into an outward-facing object.
  return Object.freeze({ slug, title, summary });
}

export async function readPublishedByPath(queryable, path) {
  if (!isPublicPath(path)) return null;
  const result = await queryable.query(
    "SELECT public_payload FROM published_snapshots WHERE public_path = $1 LIMIT 1",
    [path],
  );
  return result.rows.length ? toPublicDto(result.rows[0].public_payload) : null;
}

export async function listPublished(queryable, { limit = 20, offset = 0 } = {}) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 50 ||
      !Number.isInteger(offset) || offset < 0 || offset > 10000) {
    throw new RangeError("Invalid public pagination");
  }
  const result = await queryable.query(
    "SELECT public_payload FROM published_snapshots ORDER BY published_at DESC, item_id ASC LIMIT $1 OFFSET $2",
    [limit, offset],
  );
  return Object.freeze(result.rows.map((row) => toPublicDto(row.public_payload)).filter(Boolean));
}
