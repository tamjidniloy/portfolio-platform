// Candidate framework-independent published-only DTO boundary.
// No persistence or final API/schema decisions are implied by this module.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function projectPublishedSnapshot(candidate) {
  if (!candidate || typeof candidate !== "object") return null;
  if (candidate.visibility !== "published" || candidate.ownerApproved !== true) return null;
  const { slug, title, summary } = candidate;
  if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) return null;
  if (typeof title !== "string" || !title.trim() || title.length > 200) return null;
  if (typeof summary !== "string" || summary.length > 2000) return null;
  // Explicit allowlist. Private fields such as drafts, session, notes, tokens cannot be spread.
  return Object.freeze({ slug, title, summary });
}

export function projectPublishedList(values) {
  if (!Array.isArray(values)) return Object.freeze([]);
  return Object.freeze(values.map(projectPublishedSnapshot).filter(Boolean));
}
