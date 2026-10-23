# Phase 03.0 — Architecture Decision Backlog

**All are PROPOSED, not approved; resolve with evidence.**

| ID | Decision | Options to evaluate | Key evaluation criteria | Gate |
|---|---|---|---|---|
| ADR-ARCH-001 | SSR host/runtime | React Router framework Node adapter/Express integration patterns | SSR deployment, auth routing, support versions | Before scaffold |
| ADR-ARCH-002 | ORM/migration tooling | Prisma / Drizzle / SQL-first | Transaction model, migrations, Postgres and JS compatibility | After SRS baseline |
| ADR-ARCH-003 | Authentication/session | DB-backed session library + one-use email challenge | Security, revocation, recovery, rate limits | Before protected coding |
| ADR-ARCH-004 | Public and draft models | Single versioned content table / separate published snapshots | No leaks, atomic publish, rollback, cache correctness | After SRS baseline |
| ADR-ARCH-005 | Rich text safety | Editor data format, sanitization/presentation policy | XSS, portability, media references, SSR | Before editor build |
| ADR-ARCH-006 | File storage and delivery | S3-compatible / managed storage | ACL, cost, MIME, private preview, CDN | Owner budget/media policy |
| ADR-ARCH-007 | Transactional email | Managed email API/SMTP | Deliverability, abuse, cost, OTP flow | Owner verification/domain |
| ADR-ARCH-008 | SSR caching/revalidation | Per-route cache policy, invalidation bus | Publish/withdraw consistency and SEO | After publication model |
| ADR-ARCH-009 | Privacy/retention | Scheduled retention/explicit deletion policies | Consent requirements, audit accountability | Owner policy decision |
| ADR-ARCH-010 | Deployment & telemetry | VPS vs managed Node with Postgres | Region/cost, HTTPS, backups, logs, staging | Owner hosting preferences |
| ADR-ARCH-011 | CI/test pyramid | Unit/integration/E2E/a11y/security tool choices | 76 IDs traceability, P0 risk, rollout confidence | Before implementation |
| ADR-ARCH-012 | API versioning and UI loader contracts | Internal loaders/actions vs typed REST boundary | Public API necessity, consistency, future clients | After SRS baseline |

## How to decide
Write each ADR with context, constraints, alternatives, chosen decision, security/SEO/accessibility/privacy consequences, rollback path, and concrete tests. No feature is approved or implemented because a package appears in this table. Exact current package versions must be checked when implementing.
