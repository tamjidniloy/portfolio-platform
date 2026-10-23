# Phase 03.1 — Architecture Decision Candidates (NOT APPROVED)

These are **reviewable design preferences**, not accepted decisions, dependency installations or binding implementation contracts. The Phase 03.0 ADR backlog remains the complete list (ADR-ARCH-001..012). Each record below should be split into a canonical numbered ADR after owner approval.

## ADR-ARCH-001 — Hosting public SSR + private CMS
**Context:** One origin, owner-only CMS, crawlable public portfolio, Node/Express and React Router Framework Mode.  
**Options:** (A) React Router App Server; (B) custom Express host using `@react-router/express`; (C) separate frontend and API service.  
**Candidate preference:** B. A is simple but limits custom host integrations; C raises deployment/auth complexity.  
**Consequences:** Must manage Express middleware ordering, route handler, headers, body limits, rate limiting and deployment SSR bundle correctly.  
**Evidence:** In Phase 04 spike, create `GET /projects/:slug` SSR raw HTML, `GET /admin` anonymous redirect/denial, and protected actions under production build.  
**State:** PROPOSED. No app installed.

## ADR-ARCH-004 — Published content isolation
**Context:** FR-027/045, BR-01/04/05 no draft leakage; atomic publish/unpublish and revisions.  
**Options:** (A) content table with status field, public `status=published` queries everywhere; (B) separate immutable published projection/snapshot + private editing revisions; (C) DB materialized view.  
**Candidate preference:** B for safety/auditing, subject to storage/transaction complexity review.  
**Consequences:** Publication command performs validation, transactional activation of a version, redirect history and outbox/cache events; failures must not leak partially updated state.  
**Evidence:** Anonymous SSR/API/feed/sitemap negative tests for draft or unpublish; concurrent edit/revision conflict tests; forced rollbacks.  
**State:** PROPOSED, final shape dependent on approved SRS.

## ADR-ARCH-012 — HTTP and service interface boundary
**Context:** The single-origin website serves public SSR and owner CMS. Historical requirement sketches list `/api/v1/*`.  
**Options:** (A) internal route loaders/actions calling server services; (B) external REST API and internal SSR clients; (C) GraphQL.  
**Candidate preference:** A for Phase 04 start, plus narrow deliberately documented API endpoints where clearly required (contact, webhooks, media). Public external versioned REST **only if** a real external-consumer requirement is signed off.  
**Consequences:** Keep services framework-independent for future API use; avoid duplicate authorization policies.  
**Evidence:** Route-to-service contract review with approved SRS; E2E public and admin behavior.  
**State:** PROPOSED; no API contract approved.

## ADR-ARCH-003 — Secure owner session and OTP
**Context:** FR-038..043, NFR-005/006/007/008/021.  
**Options:** (A) signed cookie containing all auth claims; (B) opaque revocable DB-backed session ID in Secure HttpOnly SameSite cookie; (C) external identity provider.  
**Candidate preference:** B, with password verified server-side and one-use challenge before session activation. Do not store OTP plaintext.  
**Consequences:** DB lookup and revocation; brute-force/abuse throttling and session rotation. Session and OTP expiry numbers are not chosen until reviewed.  
**Evidence:** wrong/expired/reused code, session fixation, logout/revocation, CSRF and forced browsing tests.  
**State:** PROPOSED.

## ADR-ARCH-006 — Media staging and approved delivery
**Context:** FR-026/047, published-only privacy, cost, external storage and safe replacement.  
**Options:** (A) object store with private staging and controlled publication; (B) public bucket with random names; (C) app-local filesystem.  
**Candidate preference:** A. B risks premature exposure; C does not suit durable deploys.  
**Consequences:** Need upload review, type/MIME sniffing, ACL strategy, reference guards, cleanup and budget.  
**Evidence:** forbidden file uploads, anonymous staged-media access, published reference deletion, storage outage tests.  
**State:** PROPOSED; provider limits undecided.

## ADR-ARCH-008 — SSR caching and invalidation
**Context:** SEO performance and immediate removal of unpublished items.  
**Options:** (A) no caching; (B) public HTML cache with explicit event invalidation + safe TTL; (C) indefinite CDN cache.  
**Candidate preference:** B only after demonstrable invalidation; otherwise A is safer for sensitive transitions.  
**Consequences:** CDN invalidation and slug/canonical changes are coupled to publish commands; never cache admin/preview/contact data in shared caches.  
**Evidence:** cached public page after unpublish and slug redirect, sitemap after publish, authenticated content from shared cache.  
**State:** PROPOSED.

## Other ADRs to research in Phase 03.2–03.6
- ADR-ARCH-002 ORM/PostgreSQL migrations (must not lock before SRS)
- ADR-ARCH-005 rich-text data format and XSS-safe renderer
- ADR-ARCH-007 transactional email provider, delivery and budget
- ADR-ARCH-009 visitor contact/privacy/retention
- ADR-ARCH-010 deployment region, staging and telemetry
- ADR-ARCH-011 unit/integration/E2E/security/a11y/restore test stack

## Owner approval gate
Only after reviewing precise evidence and remaining open requirements should an ADR transition from PROPOSED to ACCEPTED. Any accepted decision should record date, approver, alternatives, security consequence, migration plan and test evidence. Candidate text is not an owner approval.
