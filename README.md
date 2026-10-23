# DEVFOLIO OS

JavaScript React Router Framework Mode SSR + Express + PostgreSQL. Professional **single-deployable modular monolith**, dark-first visual baseline. **Prelaunch development, not a production portfolio.** Phase 00–03 architecture documents remain intact.

## Windows 11 / WebStorm / npm / PostgreSQL / Postman

Install Node 22, Git for Windows, WebStorm, native PostgreSQL 16 and pgAdmin, and Postman. No Docker is needed locally or in CI. For the complete beginner-friendly walkthrough see [Windows setup](docs/phase04/WINDOWS11_WEBSTORM_SETUP.md).

Clone GitHub `tamjidniloy/portfolio-platform` inside WebStorm and use **main** for the merged foundation. Review ongoing database migration engineering on branch `feat/phase04-1-migration-reconciliation` without merging it as an approved schema. In WebStorm PowerShell:

```powershell
Copy-Item .env.example .env
# Edit the .env database URL; keep your private password out of Git.
npm ci
npm run check
npm run dev
```

Open http://127.0.0.1:3000/; import checked-in [Postman collection](postman/DEVFOLIO_OS_Foundation.postman_collection.json). `GET /healthz` shows process liveness; `GET /readyz` returns 200 with native PostgreSQL or 503 without it.

**Never run proposed schema DDL or implement sign-in/MFA as final contracts before explicit owner approvals.** Read [the owner gates](docs/phase04/PHASE04_IMPLEMENTATION_GATES.md), [updated architecture](docs/phase04/PHASE04_REVISED_ARCHITECTURE.md), and [Phase 03 master handoff](docs/phase03/PHASE03_MASTER_HANDOFF/PHASE03_MASTER_ARCHITECTURE_AND_HANDOFF.md).

Verification scripts: `npm run check:syntax`, `npm run lint`, `npm test`, `npm run check:no-docker`, `npm run check:secrets`, `npm run build`. Use `npm ci` for reproducible dependency installs.

## Phase 04.1 persistence work (candidate only)

The [database implementation review packet](docs/phase04/04.1_DATABASE_IMPLEMENTATION.md) and [owner approval decision sheet](docs/phase04/04.1_OWNER_APPROVAL_DECISION_SHEET.md) explain the 18-table proposal and what requires explicit signoff. A transaction helper, public-only read facade and prototype draft/publish/unpublish commands are implemented **only as isolated test code**. They are not wired to live HTTP routes or deployed migrations.

`npm run db:test:candidate` must **only** be run with `CANDIDATE_DATABASE_URL` pointing to a separately created disposable local database named `devfolio_candidate_test` or `devfolio_candidate_ci`. It deliberately fails on your normal `devfolio_dev` database, remote hosts and production. Do not copy the Phase 03 proposed DDL to production migration directories or execute it against real app data.

## Phase 04.2 isolated authentication foundation

[Session, CSRF and owner authorization handoff](docs/phase04/04.2_IDENTITY_AND_AUTHORIZATION_HANDOFF.md) and [required owner MFA decision](docs/phase04/04.2_OWNER_MFA_DECISION.md). No owner login/signup/private CMS endpoint is activated. The candidate identity integration tests run **after** candidate Phase 04.1 schema tests in a separate disposable PostgreSQL database: `npm run db:test:candidate` then `npm run auth:test:candidate`. **Never run these against `devfolio_dev` or production.** The CI pipeline executes both on GitHub's isolated native PostgreSQL service.

## Disposable 04.1 migration verification (GitHub CI)

New source files under `db/candidate_migrations/` and `server/persistence/candidate-migrator.js` implement an **isolated 18-table candidate SQL baseline**, version/checksum ledger, transaction locks, idempotent retries and rollback tests. They deliberately do **not** install application migrations, expose a new API or modify your normal `devfolio_dev` database. Read [04.1 migration reconciliation](docs/phase04/04.1_MIGRATION_RECONCILIATION.md) for optional PowerShell testing in a separately named disposable DB. `npm run check:contracts` verifies SRS/DB/API candidate counts; it is not a declaration that those contracts are owner-approved.
