# ADR-DS-001 — Phase 02.9 Design System Specification Approved

**Status:** APPROVED AT DESIGN-SYSTEM SPECIFICATION LEVEL
**Decision date:** 2026-10-23 (Asia/Dhaka)
**Approved by:** Owner's explicit decision in the project conversation.
**Does NOT imply:** Native Penpot tokens/components have been imported or built; CSS/React application is implemented; accessibility testing is complete.

## Approved
- Proposed **dark** semantic color tokens and HEX values in `09_DESIGN_SYSTEM.md` including #10151D background, #F1F5F9 foreground, #17212D card, #70D9C3 primary teal, #9CC0FF blue links and approved control boundaries/focus colors.
- Typography **scale** and hierarchy, with **no decision on exact font family**.
- 4px spacing system, radii, reference grid/container dimensions, and mobile-responsive principles.
- Reusable public/admin component direction and semantic token naming.
- Accessible label/error/focus/status/reduced-motion principles and the need for WCAG 2.2 AA verification in actual composed interfaces.
- npm-first JavaScript/React/Tailwind/shadcn implementation approach for later coding phases.

## Light mode: future-ready only
The light candidate palette/token set may be retained in design resources, but **light mode in Release 1, a working theme toggle, and production light CSS are not approved**. Design dark-first and keep alternative tokens dormant.

## Deliberately unresolved
- **Public-facing brand/name**: OPEN.
- **Exact font**: OPEN. Use fallback placeholders.
- **Authoritative approved Phase 01 SRS**: NOT present on GitHub `main`; reconcile before Phase 02 final sign-off and Phase 03 API/schema contracts. See `docs/phase01/SRS_RECONCILIATION.md`.
- Exact native Penpot token import/component build, real interactions, WCAG audit, responsive/reflow QA and React implementation: NOT VERIFIED.

## Next step
Phase 02.10: reusable UI component specification, state machines/variants, Penpot component-building guidance and editable vector reference boards. This is a separate review milestone.
