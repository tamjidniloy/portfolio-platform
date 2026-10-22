# ADR-A11Y-001 — Phase 02.11 Responsive and Accessibility Specification Approval

**Status:** APPROVED AT DESIGN-SPECIFICATION LEVEL ONLY
**Decision date:** 2026-10-23 (Asia/Dhaka)
**Owner decision:** Explicit project conversation approval
**Scope:** Responsive layout behaviors and WCAG 2.2 AA-oriented design requirements, NOT verified compliance.

## Approved
- Responsive design specifications for public and admin pages at reference widths 320, 360, 390, 768, 1024, 1440 and 1920 CSS px (test points, not mandatory CSS breakpoints).
- WCAG 2.2 AA as implementation/QA target, including 200% text resize, 320 CSS-pixel equivalent reflow, contrast/non-text contrast, keyboard/focus, status messages and accessible authentication.
- Responsive public case studies, research, reading pages and contact forms; CMS editors, mobile navigation, tables and media alternatives.
- Accessible dialogs, forms, error feedback, drag alternatives, reduced-motion preference and labeled statuses.
- Test plan and Penpot setup instructions as specified in 11_* documents.

## Explicit limits of approval
- The 52 planned QA checks remain **NOT RUN**; no PASS outcomes are asserted.
- Native Penpot responsive boards/interactive prototypes are NOT implemented or verified.
- No WCAG conformance statement is made; a real web app must be tested manually and with complementary automated tools.
- No application code installed, published or deployed.

## Preserved decisions
- ADR-UI-001: dark-first navy and muted teal/blue with editorial-engineering presentation.
- ADR-IA-001, ADR-WF-001/002/003, ADR-UX-002, ADR-DS-001/002 remain in force.
- Light palette is future-ready only, not a Release 1 feature.
- Final public brand/name and exact font remain open.
- The **authoritative approved Phase 01 SRS is missing from GitHub main**; docs/phase01/SRS_RECONCILIATION.md remains OPEN and blocks final Phase 02 sign-off.

## Next design step
Phase 02.12 — microinteractions, loading/empty/error states, dialogs, feedback, transition behavior and motion specifications with native Penpot handoff and UNTESTED acceptance cases.
