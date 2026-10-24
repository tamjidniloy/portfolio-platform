# ADR-DS-002 — Phase 02.10 Component Library Specification Approved

**Status:** APPROVED AT DESIGN-SPECIFICATION LEVEL
**Decision date:** 2026-10-23 (Asia/Dhaka)
**Approved by:** Owner through explicit project conversation instruction
**Scope:** 24 proposed component families, dark semantic tokens, variant naming and interaction state **contracts**, not actual UI implementation.

## Approved decisions
1. Shared public/admin component-library strategy covering 24 families described in `10_COMPONENT_LIBRARY.md`.
2. Reuse approved Phase 02.9 dark tokens/spacing/type scale from ADR-DS-001; light palette stays future-ready only, with NO Release 1 toggle approved.
3. Visual variants and component state guidance (hover, focus, selected, invalid, disabled, pending, empty) as specified in `10_INTERACTION_CONTRACTS.md`.
4. Distinction between visual variants, Penpot prototype transitions and server-authoritative outcomes (authentication, saved drafts, verified files, published content).
5. Accessible keyboard/focus/error semantics, content-truthfulness, responsive component patterns and npm-first JavaScript/React component mapping.
6. Maintain prior ADR-UI-001, ADR-IA-001, ADR-WF-001/002/003 and ADR-UX-002 decisions.

## Not completed or approved
- **No native Penpot main components, variants, token import or linked prototypes have been verified.** Existing SVGs and offline demo are references only.
- **No automated accessibility audit or manual browser/screen-reader QA has passed.** WCAG 2.2 AA remains the target.
- **No application code/npm packages have been installed or published.**
- **Authoritative approved Phase 01 SRS remains missing on GitHub main**; see `docs/phase01/SRS_RECONCILIATION.md`. Phase 02 overall sign-off remains blocked.
- **Public brand/name and exact font remain open.**

## Next
Phase 02.11 — Responsive Design & Accessibility Specification, viewport-by-viewport matrices, keyboard/focus interaction, accessible authentication, Penpot layout review instructions and test cases.
