# Phase 03.1 — Operability, SSR, SEO and NFR Strategy

**Status: ARCHITECTURAL REQUIREMENTS, NOT DEPLOYED OR TESTED.** Associated draft IDs: FR-044..052, NFR-001..024. The candidate SRS must be explicitly approved before release gates become authoritative.

## Rendering and cache policy
- Public primary pages: React Router SSR HTML with a published-only view service; metadata computed from published version and safe site settings. Canonical URLs and old-slug redirects are derived from server-verified published records.
- Public collection endpoints: never use admin mutation repositories; filter, pagination and search may be server-side; cache only if invalidation and safe published projection are tested.
- Sitemaps: generated from public published canonical records, not draft edit URLs or media staging.
- Admin and preview: `Cache-Control: private, no-store`, deny shared caching, `noindex`; private routes never placed in sitemap. Admin error pages must not reveal record existence to anonymous traffic.
- Session cookies: secure, HttpOnly, server revocable. Exact SameSite/session expiry/rotation policy recorded in a subsequent security ADR.
- Assets: fingerprinted build resources may use long immutable caching; user media needs explicit publication-aware ACL and cache invalidation. Never infer that media is public simply because object URL exists.

## Environments
| Environment | Role | Data policy | Exit evidence |
|---|---|---|---|
| Local (Phase 04 onwards) | Development, migrations, tests | Synthetic fixtures, never production PII | Reproducible npm and DB setup |
| CI | Unit/integration/lint/secret/dependency checks | Ephemeral DB and test storage | Repeatable green checks |
| Staging | Pre-release security/SEO/a11y/performance tests | Synthetic, anonymized or permitted nonproduction data | AT traceability, restore drill, manual review |
| Production | Published site and owner CMS | Approved real owner content and protected PII | TLS, monitoring, backups, rollback plan |

## Reliability / operations
- Structured request IDs, safe error codes, redacted logs; keep password/challenge/session/message bodies out of observability.
- Health endpoints: liveness only indicates process up; readiness reflects DB/dependency availability without revealing credentials.
- Managed PostgreSQL automated backup with periodic documented isolated restore. Backups and object storage versioning should be reviewed together for consistent recovery.
- Migrations: additive/backward-compatible releases where possible; run tests and backups before destructive migrations; stage rollout and rollback.
- Email: transient provider outage must not finalize an incomplete login, and must not cause false contact-notification delivery claims.
- Publication: design for retryable outbox/cache invalidation. Keep unsafe HTML caches disabled until explicit purge guarantees are demonstrated.
- Security: compare against OWASP ASVS 5.0.0 stable and implement a regression suite; compliance only after evidence.

## Accessibility and performance targets
- Accessible control semantics, keyboard navigation, form labels/error summaries, focus restoration, status announcements, no motion dependence, 320px equivalent reflow and 200% text resizing remain implementation obligations.
- WCAG 2.2 AA is the **target**, NOT a verified pass. Prior Phase 02 142 design cases still NOT_RUN; real-app screen-reader/browser evidence must be separate.
- LCP <= 2.5s, INP <= 200ms, CLS <= 0.1 at 75th percentile are original draft targets (not real measured results). Obtain agreed field measurements/representative traffic.

## Deployment decisions to review later
Managed Node host vs VPS, managed PostgreSQL, object store, transactional email, CDN/cache, monitoring service, budget, data region, restore objective (RPO/RTO), alerts and domains. Do not select/claim external accounts before ADR review and implementation.
