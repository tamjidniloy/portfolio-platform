# Phase 02.8 — Penpot CMS Field-Level Form Setup

**Status:** INSTRUCTIONS PREPARED; Penpot account NOT edited.
**Asset pack:** `DEVFOLIO_Phase02_08_CMS_Forms_Pack.zip` contains 18 editable SVG wireframes, PNG previews, the detailed field dictionary, CSV and JSON registry.
**Existing design file:** `DEVFOLIO OS — Public + Admin UI`
**Preserve:** ADR-UI-001, ADR-IA-001, ADR-WF-001/002/003; public brand, exact font and authoritative approved SRS still open.

## Workspace setup
1. In Penpot, create page `13 — CMS Forms & Publishing`.
2. Place imported SVG vector references in named groups: A—Field Library, B—Project, C—Research, D—Writing, E—Profile & Settings, F—Media, G—Publishing States, H—Security & Error, I—Mobile.
3. Create **native Penpot boards**, not just imported SVG: `CMS / Project Editor / Desktop 1440`, `CMS / Project Editor / Mobile 390`, `CMS / Research Editor / Desktop 1440`, `CMS / Research Editor / Mobile 390`, etc.
4. Build native reusable components: `admin/field/input`, `textarea`, `select`, `date`, `media`, `tags`, `repeatable`, `richtext`, `status`, `error-summary`, `admin/actions/draft-preview-publish`, `admin/modal/confirmation`.
5. Component states: default, focus, help, invalid, disabled, required-on-publish, saving, saved, preview, pending publish, blocked publish, published, conflict, session expired, upload rejected.
6. Desktop uses Grid/Flex for grouped forms; mobile uses one column, visible section headings, action buttons that don't cover content. Check 320px and zoom separately.
7. Show both positive and negative prototype paths; imported SVG is **not** automatically an interactive prototype.

## Critical prototype map
- Project editor → Save Draft → Private Preview → Publish validation → Publish confirm → Public project.
- Publish validation failure → field error summary → correct error → retry.
- Existing published item → edit pending revision → preview → publish new revision; alternate unpublish/archive.
- Research editor → distinct `research_status` and `status` controls → truthful public preview.
- Media picker → upload success / rejected invalid file / referenced-media delete guard.
- Site settings → safe route-ID selection and clear public preview; avoid arbitrary URL injection.
- Security → login password, OTP and recovery with safe error states.
- Mobile drawer → module navigation → editor → Save Draft → preview → return to editor.

## Reusable npm component mapping (Phase 04+, NOT installed now)
| Purpose | Planned JavaScript-friendly packages/components |
|---|---|
| Input, textarea, dialog, select, popover, feedback | shadcn/ui, selected Radix primitives |
| Form state, dirty state, repeatable fields | `react-hook-form` |
| Shared client/server validation definitions | `zod`, `@hookform/resolvers` |
| Rich article/case-study editor | `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit` |
| Content management table behavior | `@tanstack/react-table` |
| File picker drag/drop | `react-dropzone` (server verification mandatory) |
| Date management | `date-fns` |
| Icons | `lucide-react` |

`shadcn/ui` supports JSX generation with `tsx:false` in `components.json`. Check the actual React Router scaffold and current version before using CLI commands.

## Review and traceability
For each board annotate: screen ID, fields from `08_CMS_FORM_FIELD_MATRIX.md`, required-at-publish markers, backend rule notes, error/focus behavior, responsive variants and prototype destination.
The old Phase 01 draft is not the source of truth. Owner-approved SRS must be uploaded/synchronized and reconciled before final design sign-off.
