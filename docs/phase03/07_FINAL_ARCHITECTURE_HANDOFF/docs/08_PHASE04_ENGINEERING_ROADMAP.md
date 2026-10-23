# 03.7.8 — Phase04 Implementation Roadmap (No Code Built Yet)

**Scope:** 62 structured tasks in `matrices/PHASE04_WORK_BREAKDOWN.csv`, grouped into seven proposed milestones. This roadmap prepares a build; it is not a completed implementation backlog with assigned staff or production dates.

### 04.0 — Repo & environment scaffolding
- 1. Confirm SRS baseline and auth ADR before interface lock
- 2. React Router/Node/Express npm project with pinned tested versions
- 3. TypeScript decision (optional, JS baseline) and lint/format/import rules
- 4. Local Postgres test service and reproducible config
- 5. Environment variables and secret-scan gates
- 6. Health/ready probes without leak
- 7. Initial CI unit, type/check and static security gates
- 8. Owner review of Phase04 build kickoff

### 04.1 — Persistence and migrations
- 1. Reconcile candidate ERD with approved SRS
- 2. Choose ORM/SQL migration tool via ADR
- 3. Create migration version and checksum rules
- 4. Implement private content/revision storage
- 5. Implement published-only read tables/views
- 6. Idempotency key table and outbox state
- 7. Database constraints and transactional unit of work
- 8. Isolation, race and rollback integration tests

### 04.2 — Identity and authorization
- 1. Record MFA/passkey/TOTP owner choice in SRS
- 2. Owner provisioning without registration
- 3. Argon2id password hashing and brute-force defense
- 4. Credential challenge or passkey ceremony with replay defense
- 5. Session rotation, expiry, revocation and logout
- 6. CSRF/Origin/CORS cookie policy
- 7. Object authorization checks for each private read and write
- 8. Account recovery, key rotation, secret hygiene
- 9. Security integration testing including lockout and replay

### 04.3 — CMS and publication
- 1. Save draft with separate validation rules
- 2. Revision history with optimistic concurrency
- 3. Private authenticated preview and noindex/no-store
- 4. Publish version-consistent atomic snapshot and outbox
- 5. Unpublish and immediate visibility revocation
- 6. SSR/API/sitemap public-only projections
- 7. Safe slug history and redirects
- 8. Research publication truthfulness model
- 9. Admin UI for settings and content, accessible forms
- 10. Conflict, rollback and no-draft-leak E2E suites

### 04.4 — Media, contact and SEO
- 1. Object storage staging with private ACL
- 2. Upload type/signature/size/digest validation
- 3. Media references and safe delete/replace rules
- 4. Contact intake abuse/rate-limit and privacy consent
- 5. Contact store independently of notification delivery
- 6. Postcommit email outbox with retries and DLQ alerts
- 7. Canonical metadata and published-only sitemap
- 8. Conservative cache invalidation and purge failure tests
- 9. Privacy retention/deletion scheduler design and implementation

### 04.5 — Deployment and observability
- 1. Select hosting/region/DB/storage/email with budget
- 2. Provision dev/staging infrastructure via reviewed IaC
- 3. Least-privilege CI identity OIDC where supported
- 4. Immutable release artifacts and SBOM/provenance
- 5. Deploy/migration rollback and approvals by verified capabilities
- 6. Structured logs/traces/metrics and sanitized alerts
- 7. Runbooks for auth, DB, email and CDN incidents
- 8. Backups/PITR and **measured** isolated restore drill
- 9. Cost and alert-threshold tests

### 04.6 — Full verification and launch readiness
- 1. 76 FR/NFR traceability evidence and 18 gap-test review
- 2. Evaluate inherited 03.2–03.6 QA (318 cases) against actual code
- 3. Execute applicable 142 Phase02 design QA, record pass/fail
- 4. WCAG 2.2 AA keyboard/assistive technology checks
- 5. Security ASVS/OWASP test evidence with zero unmitigated criticals
- 6. Performance + Core Web Vitals evidence on realistic content
- 7. Real-content/identity/SEO/privacy legal signoff
- 8. Staging E2E, backup restore, rollback game-day
- 9. Production readiness checkpoint and explicit go/no-go

## Dependencies and release sequencing
- Architecture review can continue, but **final DB migrations and external API contracts cannot be frozen until owner-approved SRS exists**.
- Authentication implementation must resolve MFA method before completing verification flows or privacy claims.
- The first integration milestone should implement/publicize a single published content family end-to-end with safe draft and negative authorization checks.
- Staging must exercise migration/rollback/backup restore, private and published data, and truthful UI failure feedback.
- Final delivery must link every P0 requirement to executed observable evidence, including 18 historical acceptance-test mapping gaps.

## Definition of done per task
Commit linked to issue + reviewed code, tests where relevant, reproducible setup, no leaked secrets or drafts, documented constraints, CI evidence and rollback/operations notes. 'Merged' is not the same as 'QA passed'.
