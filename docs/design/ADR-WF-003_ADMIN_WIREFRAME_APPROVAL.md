# ADR-WF-003 — Admin CMS Wireframes Approved at Wireframe Level

**Status:** APPROVED AT WIREFRAME LEVEL
**Date:** 2026-10-23 (Asia/Dhaka)
**Owner decision:** Explicit approval in DEVFOLIO OS project conversation.
**Source scope:** Phase 02.7 admin CMS wireframe structures, 54 desktop/mobile SVG design references and admin workflows. No Penpot account modifications or running React code are implied.

## Approved conceptual UI
- Separate protected admin experience with authentication (password + email challenge), secure recovery and no public signup.
- Dashboard and six approved IA navigation groups.
- Content lists, editor patterns for projects, research, articles, background, profile, publication metadata, and media assets.
- Separate save draft, private preview, publish, unpublish, revision/restore interactions with explicit validation and confirmation.
- Contact inbox, website settings, SEO, account security and appropriate success/failure/loading/empty states.
- Desktop sidebar, mobile navigation drawer and stacked forms.
- Scientific research stage separated from CMS publication status; unpublished records do not leak to public pages.
- Reusable npm-first component strategy to be implemented later, not installed now.

## Existing approvals retained
ADR-UI-001 (dark navy, muted teal/blue, hybrid editorial/engineering), ADR-IA-001 (seven navigation/content IA decisions), ADR-WF-001 (homepage), ADR-WF-002 (public page templates).

## Explicitly unresolved
- **Authoritative owner-approved Phase 01 SRS** is still not present on GitHub `main`; all concrete field validation must be reconciled against it. See `docs/phase01/SRS_RECONCILIATION.md`.
- Final public-facing brand/name and exact font family remain open.
- High-fidelity admin look and feel, actual native Penpot files, responsive constraints, accessible working prototypes, real content and implementation/testing are not approved or verified.
- Operational security controls are design obligations, not guaranteed by a wireframe.

## Next design step
Phase 02.8 — field-level CMS forms and publishing workflows, with statuses, cross-field rules, server/client validation, responsive component map and Penpot wireframes; these remain review proposals until signed off.
