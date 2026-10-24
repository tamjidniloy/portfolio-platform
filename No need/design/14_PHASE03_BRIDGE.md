# Phase 02.14 → Phase 03 Architecture / Phase 04 Implementation Handoff

**Status:** IMPLEMENTATION BRIDGE, not committed architecture or runnable website.

## Agreed direction
JavaScript + React Router Framework SSR, Node/Express, PostgreSQL, npm-first maintained packages. Preserve approved dark semantic tokens and the 24 component families. React JSX (not TypeScript) remains the preference.

## Likely library mapping (verify current versions before installation)
- Tailwind CSS v4 semantic CSS variables; shadcn/ui with `tsx:false`, compatible Radix primitives.
- React Hook Form + Zod/resolvers; @tanstack/react-table; Tiptap; react-dropzone; lucide-react; optional Motion only when useful.
- Native accessible controls should be used where simpler. None installed as part of this handoff.

## Phase 03 decisions that remain unresolved
1. SSR/Express route boundaries; REST/data loaders/actions.
2. Auth and one-time email challenge, account recovery, secure cookies, rate limits, authorization and CSRF strategy.
3. PostgreSQL entity schema, migrations, transactional draft/revision publishing model.
4. Slug redirects, canonical metadata, published-only rendering, sitemap and private-preview noindex/no-store.
5. File storage/virus risk/MIME signature verification and media reference guards.
6. Contact storage, spam protection, messaging notifications, privacy and retention.
7. Form server validation, audit logging, observability, backups.
8. CI/e2e tests, a11y tests and security review.

## P0 architecture entry criteria
The authoritative approved SRS must be recovered and reconciled before *locking* schemas and API contracts. Native Penpot review or a documented owner-approved alternative should be available to engineering. No draft records should appear publicly.

## Next steps
- Import/create native Penpot designs; record link/test evidence.
- Resolve SRS block with owner-approved source.
- Create architecture decisions, C4 diagram, data model, API contract, deployment plan and test strategy in Phase 03.
- Only in Phase 04 begin app scaffolding/npm installs.
