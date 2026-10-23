# 03.7.4 — Data Model + API/SSR Crosswalk

## Candidate data groups
- **Owner identity:** `admin_users`, `auth_challenges`, `admin_sessions`, `password_reset_tokens`. Secrets as verifier/digests only; separate stronger MFA record may be needed after ADR approval.
- **Editing/publishing:** `content_items`, `content_revisions`, `published_snapshots`, `content_relations`, `content_tags`, `tags`, `slug_redirects` with version/visibility separation.
- **Media:** `media_assets`, `media_references`; storage keys never accidentally serialised to public DTOs.
- **Contact:** `contact_messages` private/retention-controlled.
- **Operations:** `audit_events`, `outbox_events`, `idempotency_keys`, `site_private_config`.

All 18 tables are **candidates** defined in Phase03.3, not applied migrations or owner-approved SQL constraints. Review column/foreign-key policies before Phase04.

## API / SSR source of truth
- The primary experience uses SSR loaders/actions. A narrower `api/v1` resource route proposal covers 29 operations and 26 paths; public stable API support must not be inferred.
- HTTP contracts use allowlisted public DTOs and deny-by-default private DTOs. Document error response families with request IDs and safe problem details.
- Owner content mutations use authenticated session + CSRF and object authorization, **If-Match**/expected-revision for edit/publish/restore, scoped idempotency for retry-sensitive POST actions.
- Public caches use only published data. Preview and all owner/session/PII responses set no-store; no cache warming should touch private revisions.

## Safe design-to-implementation gate
Before executable migrations and frozen OpenAPI endpoints: obtain owner-approved SRS (version+SHA), resolve MFA/contact retention/media limits, review the 18-table logical schema, and reconcile 29 proposed operations/41 SSR paths against the approved requirements. Preserve versioned change records for differences.

## Verification requirements
Transactional publish race, unpublish stale-cache leak, redirected slug, unreadable draft, invalid foreign key and permission denial, idempotency replay, 412/428 concurrency, deleted/expired session, upload signature, notification failure and recovery drill. These have NOT been run in this documentation phase.
