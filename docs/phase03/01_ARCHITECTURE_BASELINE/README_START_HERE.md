# DEVFOLIO OS — Phase 03.1 Architecture Baseline (Proposed)

**Prepared:** 2026-10-23 (Asia/Dhaka)  
**Status:** REVIEW CANDIDATE — not an approved architecture, application, database, API or deployment.

## What this package means
This is the first substantive **Phase 03 architecture design increment** built from the Phase 03.0 planning work and owner-reviewed Phase 02 design decisions. It describes how the public SSR website and private owner CMS could operate as a modular monolith. It does **not** assert npm packages were installed, a server was run, an app was deployed, native Penpot work was completed or any tests passed.

## Open in order
1. `docs/03_01_ARCHITECTURE_PROPOSAL.md` — recommended application/container architecture and trust boundaries.
2. `diagrams/01_SYSTEM_CONTEXT.svg`, `02_CONTAINERS_AND_TRUST_BOUNDARIES.svg`, `03_PUBLISHING_SEQUENCE.svg` — editable SVG diagrams; matching `.dot` sources included.
3. `docs/03_01_DECISION_CANDIDATES.md` — six architecture decisions with alternatives, consequences and acceptance evidence.
4. `docs/03_01_DOMAIN_AND_PUBLISHING.md` — conceptual domains, publish/preview lifecycle, recovery and concurrency rules, not a SQL schema.
5. `docs/03_01_SECURITY_THREAT_MODEL.md` — prioritized abuse cases, controls and test design.
6. `docs/03_01_OPERATIONS_AND_NFRS.md` — deployment environments, SSR/SEO, caching, reliability and accessibility design obligations.
7. `matrices/REQUEST_ACCESS_AND_CACHE_MATRIX.csv`, `matrices/ARCHITECTURE_RISK_REGISTER.csv`, `matrices/PHASE03_DECISION_BACKLOG.csv` — auditable registries.
8. `docs/03_01_PHASE03_ROADMAP.md`, `checks/OWNER_REVIEW.md` — next increments and required owner approvals.

## Non-negotiable dependency
`docs/phase01/proposals/SRS_v1_1_CANDIDATE.md` and its linked requirement catalog are **not owner-approved** as of preparation. No final SQL schema, interface contract, security timeout, storage-provider choice or Release 1 theme expansion is authorized by this package. Preserve historical requirements IDs FR-001..052 and NFR-001..024. Phase 02 design-spec approvals do not imply native Penpot or WCAG validation; 142 planned design QA cases remain NOT_RUN.

## Design constraints
- JavaScript/JSX, React Router Framework Mode SSR with Node/Express, PostgreSQL — candidate stack per project direction, not installed.
- Public SSR HTML/URLs/search/sitemap: **published-only**. Admin loaders/actions: authenticated and authorized, with no draft exposure.
- Safe owner password + one-use email challenge (implementation details to decide), secure cookie sessions and explicit access control.
- Dark-first design using approved design tokens; light tokens future-only. Final public brand/font remain OPEN.
- Honest project and scientific-status wording; publications logically separate from research work while nested within Research public IA.

## GitHub
The matching docs and editable diagrams are prepared for a **draft PR based on `main`**. Final architecture sign-off is conditional on the owner's reviewed SRS baseline, unresolved policy decisions, and review of the ADRs.
