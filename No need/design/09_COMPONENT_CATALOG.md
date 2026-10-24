# Phase 02.9 — Reusable Component Inventory

**Status:** DESIGN PROPOSAL (not built or owner-approved as final components)
**Visual foundation:** ADR-UI-001 dark-first hybrid editorial engineering.

| Family | Uses | Variants/states | Expected JavaScript implementation |
|---|---|---|---|
| Button | Public/Admin | primary, secondary, outline, ghost, destructive; hover/focus/loading/disabled | shadcn Button |
| Badge / Status | Public/Admin | published/draft/archived, study stage; text+color | shadcn Badge |
| Header / Mobile Nav | Public | desktop menu, mobile drawer, active/focus | React Router + shadcn Sheet |
| Project Card | Public | featured, compact; hover/focus | shadcn Card/Link |
| Research Evidence Card | Public | compact, detailed, labeled research status | shadcn Card/Link |
| Breadcrumbs | Both | current item, parent links | shadcn Breadcrumb |
| Admin Sidebar | Admin | expanded, active, mobile drawer | shadcn Sidebar/Sheet |
| Data Table | Admin | loading, filtered, empty, selected | @tanstack/react-table + shadcn Table |
| Form Field | Admin | text, textarea, select, dates, invalid/help/disabled | react-hook-form + zod + shadcn |
| Tag Selector | Admin | multiselect, editable, clear | shadcn Popover/Command |
| Rich Text Editor | Admin | editable, preview, validation | Tiptap |
| Media Dropzone | Admin | idle, uploading, success, rejected | react-dropzone + server verification |
| Confirm Dialog | Admin | publish, unpublish, delete, restore | shadcn AlertDialog |
| Status / Toast | Admin | saving, saved, failed, retry | sonner and inline messages |
| Skeleton / Empty State | Both | initial loading, empty collection, no matches | shadcn Skeleton/Empty |
| Code Block / Figure | Public | overflow, copy, caption, alt text | CSS + safe rendering |

## Component naming
`shared/button/primary/default`, `shared/form/input/error`, `public/card/project/featured`, `admin/editor/action-bar/draft`, `admin/table/row/selected`.

## Focus, error, responsive and state rules
- Full keyboard access; hover is never the only way to reveal controls.
- Text/label remains visible for statuses in addition to color.
- Every input has visible label; errors described via appropriate text/ARIA once implemented.
- Dialog traps focus and restores trigger focus on close; ESC/cancel path defined.
- Asynchronous save and publish do not assert success until server response confirms.
- Public cards only expose genuinely published linked content; admin drafts/previews never index publicly.
- Mobile row alternatives for complex desktop tables. 320px reflow, long text, keyboard focus and zoom must be tested.
- SVG specimen previews and token/JS examples are supplied in the companion Phase 02.9 ZIP, not direct Penpot changes.
