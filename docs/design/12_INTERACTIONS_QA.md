# Phase 02.12 — Interaction Patterns Review / QA

**Status:** Interaction design specification OWNER APPROVED (ADR-IX-001); 42 planned UX tests remain NOT RUN; native Penpot not verified.
**Parent approval:** ADR-A11Y-001 Phase 02.11 specification approval.
**Open:** Native Penpot prototypes, SRS, font, public brand; light future-only.

## Component and route review
- [ ] IP-01..IP-20 transition patterns cover public and admin flows
- [ ] Loading/empty/no-filter-results/server error are different states
- [ ] Contact success wording matches verified outcome (not email delivery assumption)
- [ ] Save, preview, publish, unpublish and restore show distinct state/confirmation
- [ ] Research scientific stage != CMS publishing status
- [ ] Media upload has file chooser, server validation and failure retry
- [ ] Form errors preserve inputs and provide summary + field hints
- [ ] Dialog cancel, Escape, focus trap, logical return focus specified
- [ ] Keyboard nav and mobile drawer controls have accessible behavior
- [ ] Persistent errors are not hidden in transient toast only
- [ ] Status messages intended for polite live announcement where relevant
- [ ] Motion specs have equal-information reduced-motion alternative
- [ ] 320px/390px behavior and 200% zoom implications annotated
- [ ] Interactive offline demo reviewed as **simulation only**
- [ ] Native Penpot boards/flows built and View mode verified (NOT DONE)
- [ ] Full browser/screen reader/a11y tests performed (NOT DONE)
- [ ] Actual approved Phase 01 SRS uploaded/reconciled (OPEN)
- [ ] Final public brand/name and exact font remain OPEN
- [ ] Owner gives explicit Phase 02.12 design-specification decision

## Test artifacts
Companion JSON and CSV matrix `qa/interaction_test_cases.*` contains 42 planned tests, all `NOT_RUN`. This does not supersede previous Phase 02.11 responsive tests (52 NOT RUN). Actual test evidence requires built Penpot prototypes or live React application as applicable.

## Sign-off gate
Owner may approve the design **specification** while native Penpot/test execution remain outstanding. Do not mark Phase 02 or accessibility certification complete until source/behavior is verified.
