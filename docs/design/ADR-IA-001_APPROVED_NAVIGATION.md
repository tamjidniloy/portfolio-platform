# ADR-IA-001 — Approved Information Architecture Decisions

**Status:** APPROVED decisions, subject to requirements traceability gate
**Decision date:** 2026-10-23 (Asia/Dhaka)
**Owner decision:** Explicit approval in project conversation following Phase 02.4 review.
**Scope:** Seven proposed IA/navigation rules, not a full phase sign-off or production implementation approval.

## Approved decisions
1. Main menu: Work, Research, About, conditional Writing, Contact.
2. Experience, Education, Skills and Achievements have dedicated public URLs, discovered via About and footer links.
3. Publications are grouped within Research; a separate public /publications listing is not required for Release 1.
4. Private CMS navigation uses six functional groups: Overview, Content, Background, Assets, Communication, Configuration.
5. Draft items and private previews must never be publicly accessible; server authorization is necessary.
6. Empty optional sections are hidden from navigation; optional collection routes can use helpful empty states, with indexing policy recorded in IA documentation.
7. Admin-configurable navigation is restricted to approved route identifiers, not arbitrary unrestricted paths.

## Maintained visual baseline
ADR-UI-001 remains in force: dark-first navy, muted teal/blue accents, hybrid minimal-editorial + engineering case studies, Penpot. Public brand/name and exact font family remain open.

## Requirements reconciliation — still OPEN
The owner reports Phase 01 complete but `docs/SRS.md` is not available on the GitHub `main` branch as of this decision. The old Phase 01 pack is labeled draft. Do not change its status without inspecting the approved version. See `docs/phase01/SRS_RECONCILIATION.md`. IA requirements crosswalk and final release design sign-off remain blocked by that reconciliation.

## Immediate next step
Phase 02.5: design desktop and mobile homepage wireframes for public screen PUB-01. Wireframes are proposed until reviewed. Do not mistake SVG import for a functioning Penpot prototype or completed UI implementation.
