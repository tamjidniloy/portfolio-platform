# Phase 02.7 — Penpot Admin CMS Setup

**Status:** Instructions only; no changes made to the owner's Penpot account.
**Package:** `DEVFOLIO_Phase02_07_Admin_Wireframes.zip` (companion conversation download).
**Includes:** 54 editable SVG vector references, selected PNG previews, contact sheets and `manifest.json`.

## Step 1 — New design page
In Penpot file `DEVFOLIO OS — Public + Admin UI`, create page `12 — Admin CMS Wireframes`.

## Step 2 — Sections on canvas
Create named sections/board groups:
- `A — Authentication & Recovery`
- `B — Dashboard & Navigation`
- `C — Collections & Tables`
- `D — Editors & Publishing`
- `E — Media & Resume`
- `F — Inbox & Messages`
- `G — Site Settings & Security`
- `H — Mobile & Exceptional States`

## Step 3 — Import SVGs
Drag relevant files from the archive's `assets/` into Penpot. Match filenames to `manifest.json`.
For each, create a **native Penpot board** using screen IDs, e.g. `ADM-08 / Project Editor / Desktop 1440`, `ADM-08 / Project Editor / Mobile 390`.
SVGs are vector reference elements; they do not automatically create responsive Flex/Grid parent structure or prototype links.

## Step 4 — Make reusable components
Create shared components before recreating the entire set:
1. Admin Shell (desktop sidebar/topbar, mobile topbar/nav drawer).
2. Navigation Item / Section Heading / Breadcrumb.
3. Stat Tile / Activity Panel.
4. Data Table Header / Row / Mobile Record Card.
5. Form Field / Select / Status Chip / Error Summary.
6. Editor Action Bar (Save Draft / Preview / Publish).
7. Confirm Dialog / Private Preview Banner.
8. Media Dropzone / Media Tile / Upload Error.
9. Message Row / Message Detail.
10. Setting Group / Toggle / Session List.
Naming: `admin/shell/default`, `admin/editor/action-bar`, `admin/table/row`, `admin/form/input/error`.

Use Penpot **Flex Layout** for sidebars, form stacks and toolbars and **Grid Layout** for dashboard tiles, media gallery and desktop record collections. Create variants for hover, focus, disabled, loading, error, success and selected state.

## Step 5 — Build flows in Prototype mode
### Admin login
ADM-01 → ADM-02 → ADM-05; incorrect challenge -> error overlay; expired code -> retry and resend path; password recovery ADM-03 -> ADM-04 -> ADM-01.

### Publish a project
ADM-05 → ADM-07 → ADM-08 → save draft -> ADM-29 private preview → ST-01 confirm publish → (published result) → public PUB-04 (verified published content).
Invalid publish -> ST-04 errors and return to editor, preserving inputs.

### Revision and unpublish
ADM-07 → ADM-08 (edit existing) → ADM-09 revision list -> compare/restore -> ADM-29 preview -> ST-01 publish. Unpublish requires separate confirmation and clear post-state.

### Media
ADM-08 editor → ADM-22 media library → select or upload → editor. Invalid files → ST-03. Referenced asset deletion -> blocked/replacement path.

### Research
ADM-10 → ADM-11 (scientific stage + CMS status) → ADM-29 preview → ST-01 publish → public PUB-06.

### Inbox
ADM-24 → ADM-25 → mark read / delete with explicit confirmation → ADM-24.

### Security and mobile
ADM-28 session revoke / logout → ADM-01. At mobile width, topbar Menu → ST-06 → selected module; drawer close returns focus. Expired session → ST-05 → ADM-01.

## Step 6 — Screen feedback and QA
Test actions, back routes, error states, mobile scrolling, focus order, drawer closure, long titles, keyboard-only flows, and content-private states. Verify 320px reflow and 200% zoom outside static drawings.

## Step 7 — Share verified design links
Add actual Penpot file URL and prototype URLs here once created. Never invent URLs, and do not send public edit access unless intentional.

## Source-of-truth caution
The owner's approved Phase 01 SRS has not been synchronized to GitHub. Review actual SRS module/field lists before finalizing a high-fidelity UI or implementing React.
