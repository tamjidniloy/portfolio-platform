# ADR-UX-002 — Phase 02.8 CMS Forms & Publishing Design Specification

**Status:** OWNER APPROVED AT DESIGN-SPECIFICATION LEVEL, SUBJECT TO APPROVED SRS RECONCILIATION
**Decision date:** 2026-10-23 (Asia/Dhaka)
**Source:** Owner's explicit project-conversation approval
**Scope:** UX behavior and proposed field-to-component mapping for Phase 02.8; not final implemented schema/API contract.

## Decisions approved
- Form design approach for Profile, Site, Projects, Research, Publications, Background, Writing, Open Source, Links, Resume, Messages, SEO and Security.
- Consistent Save Draft, Private Preview, Publish, Unpublish, Archive, Revision/Restore interaction patterns.
- Distinct draft-save vs public-publish validation; error summaries, retained inputs, failure/retry, session expiry and safer upload handling.
- Responsive desktop/mobile field patterns; accessible labels, focus, confirmation and errors.
- Prefer maintained npm packages and reusable JavaScript/React components for general form primitives.
- Research scientific stage and CMS publication state remain separate.
- Inbound contact content is read-only to admin, and secrets are server-only fields.

## Important limits: NOT approved/verified
- Authoritative approved Phase 01 SRS remains missing on GitHub main. The draft Phase 01 dictionary and provisional 16-module/147-field mapping must NOT be treated as final field requirements. Full reconciliation is required before implementation and Phase 02 completion.
- Penpot native boards/prototypes, working server authorization, database publishing, security, accessibility testing and real form behavior have NOT been implemented or verified.
- Public brand/name and exact font family remain OPEN.
- Exact validation limits, requiredness, file size and retention policies remain provisional.

## Earlier decisions preserved
ADR-UI-001 visual foundation; ADR-IA-001 navigation and CMS hierarchy; ADR-WF-001 homepage, ADR-WF-002 public pages, ADR-WF-003 admin dashboard.

## Next step
Phase 02.9 — full design system foundations, semantic tokens, typography/spacing, components/variants/states, WCAG AA review and JavaScript React/Tailwind/shadcn mapping.
