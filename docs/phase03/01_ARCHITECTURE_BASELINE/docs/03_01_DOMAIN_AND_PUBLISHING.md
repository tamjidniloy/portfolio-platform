# Phase 03.1 — Domain Concept and Publishing Invariants

**Status:** CONCEPTUAL MODEL ONLY. NOT A TABLE SCHEMA, MIGRATION OR FINAL API CONTRACT.

## Bounded-context concepts
| Concept | Purpose | Sensitivity | Key relationship / invariant |
|---|---|---|---|
| OwnerIdentity | Single provisioned administrator identity | secret/private | no open signup |
| Challenge | One-time second-step login or recovery | secret | hashed, expiring, attempt limited |
| Session | Revocable owner session | secret | bound to server-side active owner |
| ContentRecord | Type/slug/authoring identity for project/research/article/background etc. | private until published | stable ID across revisions |
| DraftVersion | Mutable/editable private content | private | never delivered by public service |
| PublishedVersion | Immutable publicly approved content snapshot | published projection | one active published version per identity/type |
| RevisionEvent | Prior authorized edit and restore metadata | private | append-only history where feasible |
| ResearchRecord | Scientific work, methodology and results | controlled publication | research stage distinct from CMS visibility |
| Publication | Paper/preprint/venue/DOI, linked to research | controlled publication | never infer peer-review status |
| MediaAsset | External object metadata, ACL and safe references | private/public by approved use | staged until publish-approved |
| UrlRedirect | Former published slug to safe current URL | public metadata | no redirect to draft content |
| Message | Contact form intake, privacy and retention | private PII | notification status separate |
| AuditEvent | Security and significant authoring actions | private | no passwords/tokens/PII in logs |
| SiteSettings | allowlisted nav, SEO defaults, links, privacy, resume | mixed | safe public projection; theme dark only |

## Authoring vs publication state (not exact DB enums)
- Draft content is editable and invisible publicly. A preview is a **permissioned view action**, not automatically a separate database state.
- Publish validates content and references, uses a transaction to atomically activate one public version, records actor/revision, and emits a cache/search/sitemap invalidation intention.
- Editing a published entry produces a new private draft version while the last confirmed published snapshot may continue to display. The published version is not mutated in place by an incomplete draft.
- Unpublish or archive removes public exposure and invalidates relevant caches and sitemap. Depending on history, old public slug returns 404/410 or an approved canonical redirect; redirects to hidden/private URLs are forbidden.
- Restore selects a prior authorized version and makes it a **new private draft or reviewed revision** before publication; never automatically expose restored content.
- No public response serializes draft document fields, secret flags, unpublished media URLs, PII inbox records or authentication data.

## Candidate publication transaction
1. Check active owner session, authorization and CSRF.
2. Check version precondition (optimistic concurrency) and validate publish-required fields and references.
3. Commit active published version + audit and durable outbox event in the same PostgreSQL transaction.
4. Return server-confirmed version/slug/response. If transaction fails, UI must not show success.
5. Process cache invalidation/sitemap updates via reliable retryable handler. During transition avoid stale public leaks (bounded caching/no caching until mechanism proven).

## Explicit failure scenarios
- **Concurrent edits:** return conflict to editor, preserve unsaved input; no blind overwrite.
- **DB unavailable:** fail without claiming draft saved or published.
- **Object storage fails:** content may remain as private draft; reject publish if required referenced media isn't verified.
- **Cache purge delayed:** prefer no shared cache for unpublished transitions; force safe invalidation and test stale content behavior.
- **Email notification fails:** stored contact message remains stored, but delivery state recorded as failed/retryable; visitor sees accurate intake result.
- **Research has no real outcomes:** show ongoing work with honest stage; don't fabricate published paper.

## Questions reserved for approved SRS / Phase 03.3
Actual table layout, foreign keys, revision model, IDs, content JSON vs normalized fields, published snapshot storage, indexing, slug uniqueness policy, hard/soft deletion, retention period, file MIME/size and provider budget.
