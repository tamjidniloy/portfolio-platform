# Phase 03 — Architecture Roadmap, Dependency Gates and Exit Criteria

**Status:** Phase 03.1 is a REVIEW CANDIDATE, not approved architecture. No implementation has begun.

| Subphase | Deliverable | Next action | Approval/lock gate |
|---|---|---|---|
| 03.0 | Plan, 12 ADR backlog, preliminary context | Already drafted and merged on GitHub, not owner-approved | Review of assumptions |
| **03.1** | Candidate C4 views, trust boundaries, route/cache matrix, 6 ADR candidates | **THIS DELIVERABLE** | Owner/technical review; statuses stay PROPOSED |
| 03.2 | Full component decomposition and service interfaces | Detail published read, authoring, auth/media/contact interfaces | No final API shape without SRS |
| 03.3 | PostgreSQL logical ERD and migration strategy | Review content revisions, enum/state, FK, indexes and time policy | **Approved SRS REQUIRED to lock schema** |
| 03.4 | SSR loader/action interfaces + selective REST/OpenAPI | Route inventory, validation contracts, HTTP auth/error semantics | **Approved SRS REQUIRED to lock contracts** |
| 03.5 | Security architecture ADRs and threat test plan | OTP/session, privacy, audit, upload, CSRF/XSS, key rotation | Owner privacy/security decisions |
| 03.6 | Media, email, ops, deployment, caching and SEO | Select providers with budget and restore/invalidation tests | Owner vendor/budget/region decision |
| 03.7 | Final architecture/Phase 04 handoff | Consolidate accepted ADRs, diagrams, schema/API specs and test plan | SRS + reviews + decisions accepted |

## Phase 03.1 review exit criteria
- [x] Context and container/source diagrams are authored with editable `.dot` and exported SVG/PNG. This marks **artifact creation**, not approved design or QA.
- [x] Identify public/private trust boundaries and published-only read projection.
- [x] Six candidate ADRs have options, tradeoffs and future evidence.
- [x] Request/caching policy matrix and security threat test starter authored.
- [ ] Owner has reviewed the preferred architecture vs alternatives and recorded an approval decision.
- [ ] SRS v1.1 candidate explicitly approved and promoted to authoritative version; requirement changes reflected.
- [ ] Privacy, retention, authentication limits and media upload limits decided or documented as explicit exceptions before locking dependent contracts.

## Phase 04 boundary
Architecture deliverables do **not** include npm installs, generated React app, migrations, live authentication, seeded records or deployment. Those begin only after architecture review and implementation authorization; Phase 04 is not commenced by this package.

## Practical next implementation spike (proposed future)
When authorized, start a short vertical slice: Node/Express + React Router SSR route loader returning only safe published sample content from mocked services; protected admin loader denies anonymous requests; integration test verifies raw HTML and negative draft leak. This is a **proposed future acceptance spike**, not already written or executed.
