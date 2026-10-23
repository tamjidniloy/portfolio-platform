# Phase 03.2 — Detailed Component Flows and Failure Rules

### Anonymous published SSR
Visitor → route loader → published-only query facade → Postgres published projection → safe DTO mapper → SSR HTML & metadata. Missing/draft/archived direct URL produces indistinguishable 404; sitemap and cache use the same public projection.

### Owner draft/publish
Owner session + CSRF + object authority → SaveDraft draft-level validation → expectedRevision check → transactional draft/revision/audit → success only after commit → authorized private preview (no-store/noindex) → publish-level validation → transaction published snapshot + revision + outbox → server-confirmed publish → retryable cache/sitemap invalidation.

### Unpublish, restore, concurrency
Unpublish modifies published projection transactionally and enqueues invalidation. Stale external cache must not return now-private data; recommended default no shared cache of detail until safe invalidation verified. Concurrent editor writes return CONFLICT, retaining nonsecret text; restore writes a fresh draft revision rather than bypassing review.

### Owner authentication
Password verification → pending one-use email challenge only → code validation (TTL, attempt/rate limits, device context) → active revocable session. Expired/replayed OTP fails; session and CSRF are checked before all owner mutations and private reads.

### Visitor contact
Validated anti-abuse intake and consent → committed contact message + outbox notification intent → truthful stored-receipt response → optional mail delivery result handled separately. No email-delivery claim from contact storage alone.

### Upload/media
Owner requests bounded private staging handle → file transferred → signature/size/hash and ownership validated → metadata finalized → attachment to draft → public derivative eligibility only after publish. Orphans/retries/replacement require controlled cleanup.

### Error handling
| Failure | Response | State |
|---|---|---|
| Field invalid | Inline errors and summary | Keep safe input |
| Session expired | Reauthenticate | No server mutation |
| Revision mismatch | CONFLICT and refresh/merge | Never silently overwrite |
| Postgres failed commit | No success toast | Public projection unchanged |
| Outbox worker failure | Retry/alert | Published DB is authoritative |
| SMTP failed after contact store | Acknowledge stored; notify pending/error | Inbox persists |
| Media failure | Upload failed, cleanup | No public orphan |

Separate Phase 02 design QA, Phase 03.2 design review, Phase 04 running-app tests. **No tests executed by this spec.**
