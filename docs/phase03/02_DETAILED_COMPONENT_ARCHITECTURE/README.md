# DEVFOLIO OS — Phase 03.2 Detailed Component Architecture

**Status:** PROPOSED AT ARCHITECTURE-DESIGN LEVEL. NOT OWNER APPROVED, IMPLEMENTED OR TESTED.
**Date:** 2026-10-23 Asia/Dhaka.
**Parent:** PR #23 / Phase 03.1 architectural baseline, merged to main.
**SRS:** \`docs/phase01/proposals/SRS_v1_1_CANDIDATE.md\` is NOT owner approved; Phase 03.3/03.4 schemas and APIs must remain provisional.

## Architecture direction

React Router Framework Mode SSR hosted on a custom Node/Express single-origin modular monolith. Components are **in-process logical boundaries**, not 26 independently deployed services. PostgreSQL is proposed as the system of record. External object storage and transactional email are accessed via explicit ports/adapters. Owner content changes occur in the CMS without application redeployment.

### Layers

1. **Delivery:** React Router route loaders/actions, Express adapter, public and admin UI. Thin handlers validate transport, call application use cases and serialize safe DTOs. Routes must never import database clients or storage/email SDKs.
2. **Application:** public published-only queries; authorized owner commands; expected-revision concurrency; DTO projection; transaction orchestration; postcommit outbox signals.
3. **Domain:** projects, research/publications, writing, profile/career, site settings/SEO, publishing/revisions, media, contact, identity and policy. No React/HTTP/ORM/SDK coupling.
4. **Infrastructure:** Postgres repositories/UnitOfWork, object storage, email, cache/search/sitemap and retryable outbox consumer. External delivery never occurs inside a SQL transaction.
5. **Operations:** health probes, redacted logs, backup and isolated restore drills, CI and controlled rollout.

## Strict public/private invariants

- Public SSR HTML, loader JSON, APIs, feeds, sitemap, search and published media expose **published content only**, via a central published-only query and allowlisted DTO mapper. Draft, archived, PII and unpublished media must not leak.
- Owner admin reading and writing requires a valid server session; mutations additionally satisfy CSRF and operation/object authorization. Frontend hiding is not security.
- Private preview is an authorized view of a draft, **not a persistent publication state**. It uses no-store/noindex and cannot be shared as public read authority.
- Publish validates server-side, locks the expected revision, creates a published snapshot/revision/audit/outbox atomically, then returns confirmed state. Postcommit outbox retries cache/sitemap work; shared caching of publish-sensitive details should remain off until safe invalidation is proven.
- Unpublish revokes public visibility even if cache invalidation is delayed; public reader remains authoritative. Restoration creates a reviewable draft.
- Research **scientific stage** is distinct from CMS publish state; no fabricated or falsely peer-reviewed publications.
- Email contact notification can fail after a message is safely stored; visitor receives accurate receipt feedback, not an unsupported delivery claim.
- Password verification leads only to a *pending* one-use email challenge; active revocable owner session starts after successful challenge.
- Media files stage privately, are inspected for actual MIME/signature/size, then attached safely. Public use requires published approval; deletion checks references.

## UI wiring

Phase 02 dark-first navy/teal/blue tokens apply to public/admin interface. Component catalog, responsive behavior, interaction contracts and contact/publish error copy are inputs, **not tests passed**. Public brand/name and exact font remain OPEN; light theme is future-ready only.

## Detailed handoff

- \`COMPONENT_CATALOG.csv\` lists M01–M26 with responsibilities and invariants.
- \`CONTRACT_MATRIX.csv\` lists candidate ports C01–C18; not OpenAPI or ORM field contracts.
- \`DEPENDENCY_RULES.csv\` lists required/forbidden coupling R01–R27.
- \`ARCH_REVIEW_QA.csv\` lists ARC32-001..042, **all NOT_RUN**.
- \`OWNER_REVIEW.md\` records approval checklist and limits.

This PR adds a coherent, reviewable 03.2 design baseline. A companion **31-file ZIP** with additional detailed documentation, PNG/SVG diagrams and a browsable HTML report is downloadable in the ChatGPT project conversation. The ZIP itself is not present in this PR unless a subsequent binary upload is verified.
