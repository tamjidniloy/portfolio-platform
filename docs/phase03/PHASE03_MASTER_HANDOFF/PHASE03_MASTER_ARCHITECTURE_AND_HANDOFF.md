# DEVFOLIO OS — THE MASTER PHASE 03 ARCHITECTURE & ENGINEERING HANDOFF

**Canonical Phase 03 main document.**  
**Coverage:** Phase 03.1–03.7; Phase 03.0 context included separately.  
**Created:** 2026-10-23 (Asia/Dhaka).  
**Status:** Architectural design documentation complete; handoff eligible for Phase 04 planning; explicit requirements/security/provider and runtime QA sign-offs must not be inferred.

## A. Architecture decision in one paragraph

Use a **single-origin, modular monolith** for the DEVFOLIO OS portfolio platform, with React Router **Framework Mode** server-side rendering in a Node/Express deployment, PostgreSQL as candidate system of record, server-side published-only read models, and an owner-only CMS behind a strong session/authorization boundary. All external email, media, cache, logging and release facilities are accessed through narrow application ports and replaceable infrastructure adapters. The domain layer is not coupled to React, Express, an ORM or provider SDKs. This is a **design direction**, not implemented or approved infrastructure.

## B. Why this exists

DEVFOLIO OS serves recruiters and AI/ML/software collaborators with truthful, search-engine-readable projects, research, experience, skills, education, writing (conditionally navigated), resume and contact. A single owner manages content through a private CMS without source edits or redeployment. The public site may only expose explicitly approved published snapshots. No invented awards, projects, metrics or research publication status. Phase 02 approved a dark-first minimal editorial + engineering-case-study UI with accessible state and keyboard patterns; native Penpot and actual WCAG verification remain separate.

## C. Trust boundaries and components (03.1, 03.2)

- **Transport**: CDN/TLS edge and SSR loaders/actions/resource routes. Public callers are untrusted. Rate limit sensitive anonymous forms, return safe error messages and enforce sane cache policy.
- **Delivery/presentation**: distinct public and admin route groups. UI handles interaction and renders allowlisted DTOs, not raw database records.
- **Application**: public read facade; owner commands; publish, unpublish, revision restore; object authorization; media upload/finalization; contact capture; login/session/recovery; outbox worker scheduling.
- **Domain**: project/case study, research/publication, writing, owner/profile/career, site settings/SEO, publishing, identity, media, contacts, audit. Scientific *research_status* is always independent from CMS publication status.
- **Persistence**: candidate PostgreSQL UnitOfWork/repositories, private revisions and a public published-snapshot read projection; migrations managed separately from request traffic.
- **Integration**: private object storage (safe published delivery), transactional email, cache/SEO invalidation and safe telemetry. External calls must not be made inside the SQL transaction.

**Strict import rule:** Delivery -> application -> domain + ports; infrastructure adapters implement ports. Public published-only query modules must not import draft repositories; public DTO serializers never spread private model rows; every owner read and mutation must enforce active authenticated authorization server-side. CSRF applies to session-authenticated mutations.

## D. Data architecture (03.3)

The original milestone proposes **18 PostgreSQL tables**, private revisions/sessions/contacts/audit/outbox, published snapshots, media reference integrity, slug redirects and idempotency keys. Canonical public records use narrowly selected columns/JSON projections, with constraints preventing duplicate slugs and stale revision updates. Publication is atomic across revision, snapshot, audit and outbox entries. Editing a published item creates a new private draft revision; preview is a protected view action, not a persistent public state. Restoration creates a reviewable draft rather than silently exposing a past version. 

The SQL DDL and relationships under `MILESTONES_EXTRACTED/03.3/` are proposals. **Do not run them as authoritative migrations** before the SRS, privacy, field limits and design ADRs are ratified. No database is provisioned by this handoff.

## E. API and SSR architecture (03.4)

**React Router loaders/actions are primary** for the website; candidate JSON resource interfaces are deliberate, not a wholesale public REST duplication. The design includes **41 route-level entries**, **29 proposed JSON API operations on 26 paths**, an OpenAPI 3.1.2 candidate (YAML/JSON), request/response examples, privacy/authorization matrices, replay/idempotency/revision-precondition semantics and problem-style errors. Public anonymous SSR, JSON, feeds, sitemap and SEO all share the published-only authorization policy. Owner API and preview are private and `Cache-Control: no-store`, with noindex as appropriate. Candidate publishing methods require expected revisions and clear server-confirmed outcomes, never client-only success.

The schema and route formats remain versioned **proposals**, not final bindings or implemented endpoints.

## F. Authentication and security (03.5)

Owner must be provisioned securely, with no visitor signup; deny-by-default permissions on private data and admin functions. Security responsibilities include login and recovery, Argon2id password verifier if passwords are retained, rotation/revocation of secure HttpOnly sessions, same-origin + CSRF controls, carefully bounded media staging, redacted audit logs, rate limiting, rich-content sanitization/CSP, dependency and supply-chain controls, and isolated storage/backup ACL. An explicit threat register and authorization policy matrix live in milestone 03.5.

**Critical unresolved requirements conflict:** the historical SRS specifies password followed by an emailed challenge. NIST SP 800-63B-4 says email **SHALL NOT** be used as out-of-band authentication. The recommended **candidate** is phishing-resistant WebAuthn/passkeys for owner sign-in, with an owner-reviewed password+TOTP migration/fallback strategy if needed; email can support contact verification/recovery, not be claimed as a NIST-recognized authentication factor. **The owner has not explicitly chosen a final MFA scheme in this conversation.** No NIST AAL2, penetration-test or ASVS conformance claims are made.

NIST reference: https://pages.nist.gov/800-63-4/sp800-63b/authenticators/

## G. Infrastructure / release / reliability (03.6)

Proposed environments: separate development, staging and production configurations, with least-privilege identity and restricted network access. Evaluate a managed Node deployment (vs container/VPS) with managed PostgreSQL, private object storage, transactional email, TLS edge and telemetry. Keep secrets out of source. CI/CD planning describes test matrices, dependency/supply-chain scanning, short-lived credentials/OIDC where supported, provenance and immutable artifact/promote/release/rollback. Those templates are **non-operative**, not installed under `.github/workflows/`. Operational documentation contains alert models, seven incident/recovery runbooks, and backup/restore planning.

**Availability:** 99.9% monthly remains an aspirational P1 target, not SLA proof. Example RTO=4h / RPO=24h are planning hypotheses requiring owner approval and measured restore drills. Provider/region/spending/retention/backup media-consistency policy remains open. No cloud services, backups or CI deployments have been activated.

## H. Consolidated owner decisions and QA (03.7)

Each Phase 03 milestone's source documents remain preserved in the archive. The Phase 03.7 handoff maps **52 FR + 24 NFR** as design traceability, consolidates 20 architecture decisions and a **62-item Phase 04 roadmap**, with 50 integration review cases. Historical QA planned cases remain **NOT_RUN**. The 142 Phase 02 design QA cases are a different outstanding body of work. Only archive integrity/static format validation passed; none of that constitutes executable application acceptance.

### Hard-stop gates before final API/DB freeze or production

1. **SRS owner approval**: read exact proposed `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md` + `REQUIREMENTS_CATALOG_v1_1_PROPOSED.md`, approve version/decisions/commit, then promote to canonical `docs/SRS.md` and update reconciliation register.
2. **MFA**: explicitly select passkey/WebAuthn-first or another reviewed factor, update FR-040 and impacted auth/route/test docs. Email must not be falsely described as NIST out-of-band MFA.
3. **DB/API contracts**: decide on the SRS-based data dictionary, retention, media limits, idempotency, version/concurrency, route exposure, privacy and security changes, then sign off migration and OpenAPI revision together.
4. **Operations**: provider, region, budget, recoverability and real CI approval enforcement selected.
5. **QA**: native Penpot evidence, design and architecture checks, browser keyboard/a11y, security tests, performance and isolated DB/media restore executed in later build/staging phases.

**Do not use the phrase "all checks passed" or "final deployed architecture approved" before evidence is available.**

## I. Phase 04 implementation roadmap

Treat the original `MILESTONES_EXTRACTED/03.7/.../matrices/PHASE04_WORK_BREAKDOWN.csv` as the authoritative **planning backlog** containing 62 candidate tasks; it is not implementation work completed. Recommended dependency order:

1. Repo/toolchain bootstrap and reproducible React Router SSR + Express shell, secret-free configuration, CI checks.
2. Core domain modules, safe route/public DTO constraints, initial candidate data migration set *after SRS decision*.
3. Owner authentication, session/CSRF, permission gates and private preview negative tests *after MFA decision*.
4. CMS editors, draft/publish transaction and outbox, versioning and recovery, staging media and user inbox.
5. Public content/SEO/404/sitemap and conditional Writing; integrations and progressive performance/a11y.
6. Staging deployment, regression testing, threat and restore drills, privacy/release evidence and gated production launch.

Build, test, and release work is Phase 04+; no implementation is claimed by this master archive.

## J. Exact source index / how to read

| Milestone | Primary reference within this master ZIP |
|---|---|
| 03.1 System architecture baseline | `MILESTONES_EXTRACTED/03.1/docs/03_01_ARCHITECTURE_PROPOSAL.md` |
| 03.2 Component architecture | `MILESTONES_EXTRACTED/03.2/docs/01_COMPONENT_ARCHITECTURE.md` |
| 03.3 PostgreSQL ERD | `MILESTONES_EXTRACTED/03.3/DEVFOLIO_OS_Phase03_03_Database_Architecture/docs/02_LOGICAL_ERD_AND_DATA_DICTIONARY.md` |
| 03.4 APIs | `MILESTONES_EXTRACTED/03.4/DEVFOLIO_OS_Phase03_04_API_Architecture/api/openapi-3.1.2-candidate.yaml` |
| 03.5 Security | `MILESTONES_EXTRACTED/03.5/DEVFOLIO_OS_Phase03_05_Authentication_and_Security_Architecture/README_START_HERE.md` |
| 03.6 Infrastructure | `MILESTONES_EXTRACTED/03.6/DEVFOLIO_OS_Phase03_06_Deployment_Infrastructure_Reliability_DevSecOps/README_START_HERE.md` |
| 03.7 Final engineering handoff | `MILESTONES_EXTRACTED/03.7/DEVFOLIO_OS_Phase03_07_Final_Architecture_Integration_and_Handoff/docs/01_EXECUTIVE_HANDOFF.md` |

Every original file is additionally available unchanged in the corresponding ZIP under `ORIGINAL_UNMODIFIED_ARCHIVES/`. Use `FILE_MANIFEST_SHA256.csv` for a complete machine-readable listing. The GitHub-only approval record for Phase 03.2 is separately attached. The ZIP includes references to the GitHub branch for anything maintained solely there; its canonical architecture *proposal* remains the originally generated files above, not any unverified deployment.

## K. GitHub history

Repository: `https://github.com/tamjidniloy/portfolio-platform`  
Phase 03.7 original PR #32 merged into intermediate 03.6 branch; PR #33 subsequently merged final handoff into **main** on 2026-10-23.  
The documentation merge is **not** owner approval of the SRS, MFA, DB/API or runtime/security acceptance.