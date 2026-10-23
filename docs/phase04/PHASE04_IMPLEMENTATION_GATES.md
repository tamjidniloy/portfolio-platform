# Phase 04 decision and execution evidence

**Date:** 2026-10-23. Baseline: Phase 03 master handoff on main. Code, tested runtime, owner signoff and deployment proof are distinct states.

| Milestone | Roadmap tasks | State | Required signoff/evidence |
|---|---|---|---|
| 04.0 | P4-001–008 | Native Windows/CI implementation verified; formal owner gates remain open | Branch-specific CI, owner acceptance of P4-001/P4-008 |
| 04.1 | P4-009–016 | Candidate-only persistence and 04.1 DB tests **verified**; live migration not approved | Exact SRS/MFA/DB/API/retention approval + reviewed migration tool/schema |
| 04.2 | P4-017–025 | Candidate-only session/cookie/CSRF/authorization work under test; no live sign-in | Explicit MFA/recovery ADR, final auth schema, owner enrollment, brute force and browser security tests |
| 04.3 | P4-026–035 | NOT IMPLEMENTED | Approved API/schema; private CMS, publish atomicity, no draft leak |
| 04.4 | P4-036–044 | NOT IMPLEMENTED | Media/email provider, privacy rules, integration tests |
| 04.5 | P4-045–053 | NOT IMPLEMENTED | Cloud/provider/region/budget, staging, real backups and restore |
| 04.6 | P4-054–062 | NOT EXECUTED | 76-requirement traceability, security, WCAG, performance, launch go/no-go |

**Owner gates still OPEN:** authoritative SRS candidate `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md`; FR-040 MFA; final DB migrations/data retention; versioned API shapes/privacy; hosting/region/storage/email/backup policy; production readiness. A candidate specification must never be promoted to approved merely because code was requested.

**Evidence log** (update after real run): commit SHA, GitHub Actions run URL, native PostgreSQL version, npm ci, unit result, build result, HTTP smoke, audit, failures/retests, reviewer signoff. A workflow pass is not a penetration test, accessibility audit or production deployment.

## Verified native PostgreSQL foundation evidence

- Feature branch: `feat/phase04-windows-native-development`.
- Commit `e90666cc29057eeb15a8e6951d8c5832ed89c636`: [successful GitHub Actions run 39987605366](https://github.com/tamjidniloy/portfolio-platform/actions/runs/39987605366).
- GitHub-hosted Ubuntu 24.04 runner: native PostgreSQL 16 apt installation (no container services), reproducible `npm ci`, static checks and no-Docker verification.
- **14 unit tests passed**, **1 native PostgreSQL integration test passed**; environment doctor, production SSR build, homepage/work/research/404/admin-negative HTTP smoke and dependency audit passed.
- These checks do not constitute a Windows laptop test, full database migrations, CMS, pen test, WCAG audit, managed deployment or owner release approval.

## Phase 04.1 candidate sync

Phase 04.1 test-only database work is maintained in `docs/phase04/04.1_DATABASE_IMPLEMENTATION.md`; decisions in `04.1_OWNER_APPROVAL_DECISION_SHEET.md`. Original Phase 03.3 18-table DDL **remains unchanged and proposed**. Git blob SHA `d46185cf2154c207fc40f52289be451ad30f6079`; SRS candidate Git blob SHA `e621b581002b3d39ba1b7e7d3622deceb5d71420`. These are reference identities, **not** approval signatures. CI evidence must be updated after the relevant branch run.

## Verified 04.1 candidate run (not schema approval)

- Source code `fbf06e41d6216b13aee955ced99129e8783cd721`: [CI run #39992176512](https://github.com/tamjidniloy/portfolio-platform/actions/runs/39992176512), successful. PostgreSQL 16 installed natively on Ubuntu without Docker.
- 21 unit tests PASS, 1 normal PostgreSQL connectivity test PASS and 7 isolated candidate-schema integration tests PASS (using dedicated disposable `devfolio_candidate_ci`). Existing SSR build/HTTP smoke, lint, npm ci, heuristic secret scan and dependency audit PASS.
- No approved migration has been created or run. A successful candidate-schema test is **not** owner approval of SRS, MFA, schema or API contract.

## 04.2 candidate session security work

Source and approval documents: [identity handoff](04.2_IDENTITY_AND_AUTHORIZATION_HANDOFF.md) and [owner MFA decision sheet](04.2_OWNER_MFA_DECISION.md). Pending final CI evidence. No owner login endpoint is active; future session issuance requires a verified authenticator adapter. Approving a feature branch is not approval of FR-040 or production security posture.
