# Phase 03.0 — System Architecture Planning & Decision Framework

**Status:** PROPOSED PRE-ARCHITECTURE PLAN, NOT TECHNICAL DESIGN APPROVAL.
**Date:** 2026-10-23. **Linked:** `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md`, historical FR/NFR, approved Phase 02 design specifications.
**Entry condition:** Architecture discovery/planning may begin now; **binding DB schema and API contract sign-off must wait** for owner-approved SRS.

## Outcomes of Phase 03
1. C4 context/container/component views with trust boundaries and deployment mapping.
2. Decision records for runtime, routing/data, persistence/migrations, email challenge/session, media, SEO/cache and deployment.
3. Domain model and ERD for project, research/publication, article, media, contact, owner and publishing/revision/audit.
4. REST/interface/API documentation for public published data and protected owner mutations; raw SSR content and preview policies.
5. Threat model: credential attack, session theft, authorization, preview leakage, file upload, XSS/CSRF, contact PII, error/log leak.
6. Reliability/ops plan for backup/restore, monitoring, staging, secrets, migrations and failure handling.
7. Test/evidence plan mapping FR-001..052 and NFR-001..024 to unit/integration/E2E, security, accessibility and performance.
8. Clear Phase 04 npm-first JavaScript React implementation handoff, with versions selected/verified through ADRs rather than invented today.

## Candidate stack — not locked
JavaScript/React Router Framework SSR, Node and Express host integration, PostgreSQL modular monolith. ORM, storage, email, hosting, session library, deployment region and CI/CD remain choices to analyze. Candidate UI packages: maintained accessible primitives, Tailwind CSS v4 + semantic CSS tokens, React Hook Form/Zod, TanStack Table, Tiptap, react-dropzone, Lucide; choose only after compatibility/security checks. No installation or deployment performed.

## Proposed bounded contexts
| Domain | Responsibility | Public visibility | Critical invariants |
|---|---|---|---|
| Identity & Sessions | Owner provisioning, password + OTP, recovery/revocation | None | Verify every admin request; rate limit |
| Content Editing | Drafts, validation, sections, revisions | Admin only | Draft never publicly serialized |
| Publishing | Published snapshots, slug/version, redirects | Published projection | Atomic, server confirmed, cache/sitemap invalidation |
| Research & Publications | Experiments, distinct published paper records, research-stage taxonomy | Published records only | Status truthfulness |
| Media Assets | Upload/validate/link/reference/restrict | ACL as published usage permits | No unsafe orphan/deletion |
| Site Configuration | Approved routes, theme dark tokens, SEO, social/resume flags | Public safe projection | No open redirect or private field leaks |
| Contact Inbox | Public message intake, spam, privacy, notifications | Intake only; admin reads | Storage vs email delivery separation |
| Operations & Audit | Logs, health, backups, controlled deployment | Public limited health if needed | No secrets/PII in telemetry |

## Workstream deliverables, ownership and sequencing
| Stage | Deliverable | Can proceed before SRS approval? | Completion definition |
|---|---|---|---|
| 03.0 | Constraints, risks, candidate decisions, plan | Yes | Owner review of plan + unresolved gates |
| 03.1 | C4 trust-boundary architecture alternatives | Yes as candidate | Design review, explicit ADR candidates |
| 03.2 | Data conceptual model | Yes as sketch only | Trace every domain to candidate FR IDs |
| 03.3 | Logical ERD and migration strategy | Draft only | Lock after approved SRS |
| 03.4 | API contracts and SSR loaders/actions | Draft only | Lock after approved SRS |
| 03.5 | Auth/session and security threat model | Yes; final gates pending | Security ADR decisions and tests |
| 03.6 | Media/SEO/caching/deployment/ops | Yes; provider decisions pending | Deployment + RTO/RPO cost review |
| 03.7 | Final architecture/test/phase04 handoff | No | Owner-approved SRS, final ADRs, traceability and review |

## Immediate Phase 03.0 tasks
1. Owner reviews v1.1 proposed SRS and 28-point reconciliation register. Record deliberate acceptance of any unresolved later-phase choices.
2. Design C4 context/container drafts, listing all public-private data paths and leak test points.
3. Prepare 10–12 candidate ADRs from backlog, with tradeoffs, threat assumptions, validation and consequences.
4. Create high-level ER sketch and publish-state machine (not production schema).
5. Define public-only SEO/SSR caching policy and private preview noindex/no-store policy.
6. Define acceptance testing taxonomy, test environments and accessibility verification owner.
7. Lock API/schema only *after* owner approval and consistent requirements matrix.

## Phase 03.0 review exit criteria
- [ ] Candidate SRS reviewed, open requirements decisions listed and assigned.
- [ ] Architecture options and dependency diagram available.
- [ ] Security/privacy/SEO trust boundaries explicit.
- [ ] ADR backlog prioritized with owner/engineer decision dates.
- [ ] No unsupported assertions about implemented app, database or passing QA.
