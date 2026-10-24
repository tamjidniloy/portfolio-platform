# ADR-IX-001 — Phase 02.12 Interaction and Motion Specification Approval

**Status:** APPROVED AT DESIGN-SPECIFICATION LEVEL ONLY
**Decision date:** 2026-10-23 (Asia/Dhaka)
**Approved by:** Portfolio owner, explicitly in project conversation
**Scope:** The Phase 02.12 interaction behaviors, feedback and motion **design specifications**.

## Approved
- Twenty interaction contracts IP-01..IP-20 covering public navigation/cards/filters, contact, admin drafts/private preview/publishing, media, authentication, session expiry, status and errors.
- Separate loading, truly empty, filtered-no-results, validation-failed, server-error and recoverable-state patterns.
- Server-confirmed statuses: never imply draft saved, upload verified or content published until authoritative response.
- Proposed microinteraction timings (fast 120ms, normal 180ms, slow 240ms), subtle/nonblocking effects, reduced-motion equivalents and clear focus/keyboard behavior.
- Accessible modal cancel/confirm paths, semantic messaging, error summaries, preserved unsaved data where safely possible.
- Preserve previous design approvals and dark-first system. Light palette remains FUTURE-READY ONLY.

## Not approved or verified
- Actual native Penpot boards, component prototypes, overlays, interactions, and URLs have NOT been created/verified.
- The 42 interaction QA cases remain **NOT RUN**. No accessibility/conformance claim.
- No real React or backend behavior, authentication, uploads or publishing has been implemented.
- Exact public brand/name and font family remain OPEN.
- **Authoritative approved Phase 01 SRS** still missing from GitHub main; requirements reconciliation still blocks overall Phase 02 sign-off. See docs/phase01/SRS_RECONCILIATION.md.

## Next step
Phase 02.13 — high-fidelity public/admin screen designs, importable vector references, connected local prototype, explicit Penpot board/link map and quality-review matrix. Penpot import and native prototype creation remain manual until a compatible integration is available.
