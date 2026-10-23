# DEVFOLIO OS

JavaScript React Router Framework Mode SSR + Express + PostgreSQL. Professional **single-deployable modular monolith**, dark-first visual baseline. **Prelaunch development, not a production portfolio.** Phase 00–03 architecture documents remain intact.

## Windows 11 / WebStorm / npm / PostgreSQL / Postman

Install Node 22, Git for Windows, WebStorm, native PostgreSQL 16 and pgAdmin, and Postman. No Docker is needed locally or in CI. For the complete beginner-friendly walkthrough see [Windows setup](docs/phase04/WINDOWS11_WEBSTORM_SETUP.md).

Clone GitHub `tamjidniloy/portfolio-platform` inside WebStorm and use **main** for the merged foundation. The owner-approved Release 1 contract work is available for review on branch `docs/release1-owner-approved-contracts` until its PR is merged. In WebStorm PowerShell:

```powershell
Copy-Item .env.example .env
# Edit the .env database URL; keep your private password out of Git.
npm ci
npm run check
npm run dev
```

Open http://127.0.0.1:3000/; import checked-in [Postman collection](postman/DEVFOLIO_OS_Foundation.postman_collection.json). `GET /healthz` shows process liveness; `GET /readyz` returns 200 with native PostgreSQL or 503 without it.

**Release 1 SRS/MFA/DB/API engineering contracts were explicitly owner-approved on 2026-10-24.** This does not make historical candidate SQL production-ready: do not execute unreviewed migration SQL against real databases, or expose login until real passkey verification and negative security tests pass. Read [the owner gates](docs/phase04/PHASE04_IMPLEMENTATION_GATES.md), [updated architecture](docs/phase04/PHASE04_REVISED_ARCHITECTURE.md), and [Phase 03 master handoff](docs/phase03/PHASE03_MASTER_HANDOFF/PHASE03_MASTER_ARCHITECTURE_AND_HANDOFF.md).

Verification scripts: `npm run check:syntax`, `npm run lint`, `npm test`, `npm run check:no-docker`, `npm run check:secrets`, `npm run build`. Use `npm ci` for reproducible dependency installs.

## Phase 04.1 persistence work (candidate only)

The historical [database implementation review packet](docs/phase04/04.1_DATABASE_IMPLEMENTATION.md) and [owner approval decision sheet](docs/phase04/04.1_OWNER_APPROVAL_DECISION_SHEET.md) explain the 18-table proposal and what requires explicit signoff. A transaction helper, public-only read facade and prototype draft/publish/unpublish commands are implemented **only as isolated test code**. They are not wired to live HTTP routes or deployed migrations.

`npm run db:test:candidate` must **only** be run with `CANDIDATE_DATABASE_URL` pointing to a separately created disposable local database named `devfolio_candidate_test` or `devfolio_candidate_ci`. It deliberately fails on your normal `devfolio_dev` database, remote hosts and production. Do not copy the Phase 03 proposed DDL to production migration directories or execute it against real app data.

## Phase 04.2 isolated authentication foundation

[Session, CSRF and owner authorization handoff](docs/phase04/04.2_IDENTITY_AND_AUTHORIZATION_HANDOFF.md) and [required owner MFA decision](docs/phase04/04.2_OWNER_MFA_DECISION.md). No owner login/signup/private CMS endpoint is activated. The candidate identity integration tests run **after** candidate Phase 04.1 schema tests in a separate disposable PostgreSQL database: `npm run db:test:candidate` then `npm run auth:test:candidate`. **Never run these against `devfolio_dev` or production.** The CI pipeline executes both on GitHub's isolated native PostgreSQL service.

## Disposable 04.1 migration verification (GitHub CI)

New source files under `db/candidate_migrations/` and `server/persistence/candidate-migrator.js` implement an **isolated 18-table candidate SQL baseline**, version/checksum ledger, transaction locks, idempotent retries and rollback tests. They deliberately do **not** install application migrations, expose a new API or modify your normal `devfolio_dev` database. Read [04.1 migration reconciliation](docs/phase04/04.1_MIGRATION_RECONCILIATION.md) for optional PowerShell testing in a separately named disposable DB. `npm run check:contracts` verifies SRS/DB/API candidate counts; it is not a declaration that those contracts are owner-approved.

## Owner-approved Release 1 contract baseline

Owner acceptance: [decision/evidence record](docs/phase04/RELEASE1_OWNER_ACCEPTANCE.md). Canonical authority: [SRS-R1](docs/SRS.md) + [all 76 requirements](docs/REQUIREMENTS_CATALOG.md), [AUTH-R1](contracts/release1/AUTH_R1.md), [DB-R1 reference](contracts/release1/DB_R1.md) with [19-table SQL](contracts/release1/DB_R1.sql), [API-R1](contracts/release1/API_R1.md) and [OpenAPI 3.1.2 JSON](contracts/release1/openapi.json) (37 operations), [41 planned SSR routes](contracts/release1/SSR_UI_ROUTES.csv). All older `docs/phase01/proposals/` / `docs/phase03/` documents and `db/candidate_migrations/` files remain **historical candidate** design/test fixtures.

`npm run check:contracts` validates the approved metadata. GitHub native PostgreSQL CI also applies the **new 19-table reference DDL only to a dedicated disposable local database** using `npm run db:test:release1`. No automatic migration, WebAuthn endpoint or production CMS is activated by owner specification approval. Engineering and launch QA gates remain open.

## Phase 04.3 CMS/publishing candidate

[Phase 04.3 handoff](docs/phase04/04.3_CMS_IMPLEMENTATION.md) documents the owner-bound draft/edit/history/preview/publish/unpublish/restore service, private React Router editor, published-only Work/Research SSR, canonical `/projects` and protected JSON APIs. CMS is disabled unless `CMS_API_ENABLED=true` and separate approved DB-R1/CSRF/origin settings are supplied. **Do not activate CMS against production before real WebAuthn login and migration/security tests are complete.** Native PostgreSQL CI tests use the disposable `devfolio_cms_ci` database only.

## Integrated R1 DB / Passkeys / CMS

Use [approved migration runbook](docs/phase04/04.1_RELEASE_MIGRATIONS_RUNBOOK.md), [offline owner WebAuthn provisioning](docs/phase04/04.2_OWNER_PASSKEY_RUNBOOK.md), [CMS implementation](docs/phase04/04.3_CMS_IMPLEMENTATION.md) and [retention operations](docs/phase04/04.3_RETENTION_OPERATIONS.md). Database migration/retention commands require exact operator confirmation; production must use distinct `CMS_DATABASE_URL` and restricted `CMS_PUBLIC_DATABASE_URL`. The `CMS_API_ENABLED` and `CMS_AUTH_ENABLED` flags remain OFF by default; no real owner device, staging or production environment was used for CI. The updated feature branch is `feat/phase04-release1-unblock`.

## Phase 04.4 — Media, Contact and privacy integrations

[Phase 04.4 operator and engineering runbook](docs/phase04/04.4_MEDIA_CONTACT_INTEGRATIONS.md) covers isolated private S3-compatible browser upload, verification, immutable references and safe deletion; consent-based contact intake and owner inbox; Resend postcommit notification worker with retry/DLQ, optional Cloudflare cache purging and published-only SEO; scheduled retention/orphan cleanup. All external provider and contact features remain disabled until reviewed and configured. `npm run integrations:test` requires only the dedicated ephemeral `devfolio_integrations_ci` database.


## Phase 04.5 — Deployment infrastructure reference (not provisioned)

The no-Docker Terraform AWS staging reference, OIDC-restricted/manual deployment release workflow, safe structured HTTP telemetry, alarms, PITR/restore drill and operating runbooks are documented in [04.5 deployment and observability](docs/phase04/04.5_DEPLOYMENT_INFRA_OBSERVABILITY.md). **Do not confuse merged code or CI verification with running hosting.** AWS provider/region/budget, GitHub Environment permissions, real deployment, DB migrations, passkeys, external provider functionality and measured operational drills are pending owner-controlled execution and approval. Phase 04.6 final QA remains unexecuted.
