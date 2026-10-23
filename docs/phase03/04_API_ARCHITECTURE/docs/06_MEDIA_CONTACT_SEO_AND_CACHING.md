# 03.4.6 — Media, Contact, SEO and Cache Interface Design

## Media workflow
1. Authenticated owner requests a staging intent with declared MIME, size and optionally SHA-256.
2. Server authenticates+CSRF, bounds inputs, creates a *private* scoped upload and returns a short-lived signed URL to the owner. **Never put signed URLs in public DTOs, logs, analytics or shared cache.**
3. Owner uploads to private staging; finalize endpoint re-checks actual signature, MIME, digest, byte size, actor and storage ownership before marking ready. Upload constraints/vendor still undecided.
4. Public delivery only if an asset is linked to the exact eligible published revision. Deletions/replace require referential safety; obsolete staging is garbage-collected by an auditable background process.

## Contact workflow
POST `/api/v1/contact` validates anti-abuse controls, consent as configured and message text; transaction stores a private contact message and notification intent. 201 indicates **stored**, never SMTP delivery confirmation. Notification failure is visible only to the owner/ops (redacted logs), not leaked to visitor.

## SEO, canonical paths, redirects
- SSR metadata, indexable text, sitemap and canonical URLs originate only from published snapshots and safe site settings.
- A draft slug direct URL must be indistinguishable from absent content for anonymous visitors: 404; not `302 /admin/login`.
- Preview: cookie owner session, `private, no-store`, `noindex,nofollow`, safe `Vary` and never public CDN.
- After unpublish: anonymous detail pages and all JSON resource reads immediately 404. Redirects only from historical **published** slug to an existing currently published canonical path; no open redirects.
- Writing primary nav conditional on genuinely published items. Release 1 only dark theme; future light tokens dormant.

## Caching policy candidate
| Surface | Default policy before tested invalidation | Notes |
|---|---|---|
| Anonymous published pages | no-store or tightly controlled origin revalidation | Start conservative for unpublish safety |
| Public JSON collections | origin controlled caching only after safe generation strategy | No draft/private joins |
| Admin loaders, JSON and forms | private, no-store | Cookies + CSRF and PII |
| Owner preview | private, no-store; X-Robots-Tag noindex/nofollow | No CDN caching |
| Signed upload URLs | private, no-store and short expiry | Never persist in public browser logs |
| Sitemap | generation-based invalidation | No stale unpublished links |
| Static hashed assets | immutable long-cache | Never private media |

Cache lifetime and CDN architecture require a verified ADR; a 200 response alone is not proof that a withdrawn item is gone everywhere.
