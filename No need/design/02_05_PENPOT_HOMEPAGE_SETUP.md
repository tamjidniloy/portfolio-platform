# Phase 02.5 — Penpot Implementation Instructions

**Status:** Instructions + editable SVG references prepared. Penpot file itself not modified automatically.
**Penpot design file:** DEVFOLIO OS — Public + Admin UI (owner-managed)

## Step 1 — Import asset pack
Download `DEVFOLIO_Phase02_05_Homepage_Wireframes.zip` from the project conversation and extract on Windows. SVGs:
- PUB-01_Home_Desktop_1440.svg
- PUB-01_Home_Tablet_768.svg
- PUB-01_Home_Mobile_390.svg
- PUB-01_Home_Sparse_Content_1440.svg

## Step 2 — Add design page and boards
In Penpot create page `10 — Homepage Wireframes`.
Create four native Penpot boards:
- `PUB-01 / Desktop 1440`
- `PUB-01 / Tablet 768`
- `PUB-01 / Mobile 390`
- `PUB-01 / Sparse Content`
Import SVG assets as vector reference layers next to or inside corresponding boards. The SVG shapes can generally be selected/editable, but imported SVG does not automatically turn into a native responsive Penpot structure; do not mistake it for finished layout constraints.

## Step 3 — Rebuild with native Penpot constraints
Use Penpot Grid Layout for outer desktop content and 2-column project grid; Flex Layout for navigation, card interiors, actions and vertical mobile stacks. Set growing/fit sizing and constraints intentionally.
- Desktop: reference 1440 width, ~1248 content, ~96 gutters, project grid 2 columns.
- Tablet: reference 768 width, ~42 gutters, simplified hero without illustration.
- Mobile: reference 390 width, ~20 gutters, one-column stack, menu control.
- Reusable components: navigation link, CTA button, project card, research row/card, section heading, skill chip, status label, background summary, contact block, footer link.
- Keep placeholders explicitly marked until actual verified profile content is available.

## Step 4 — Create prototype interactions
Penpot supports click connections between boards. Actual targets:
- Work => PUB-03, Research => PUB-05, About => PUB-02, Writing => PUB-11 (only populated), Contact => PUB-13
- project cards => PUB-04, research cards => PUB-06
- mobile menu control => Menu Overlay board (create `PUB-01 / Mobile Nav Open`)
- close menu => close overlay; after navigate, navigation state/focus requirements must be verified during implementation.
Create the other PUB boards as placeholders if not yet wireframed so prototype connections can resolve, and label them DRAFT.

## Step 5 — Variant states
Build a conditional-content variant (no projects/research/writing) using the sparse-content reference.
Create at least one mobile menu open/closed state; note keyboard and reduced-motion behavior.
Add a text-length stress test using realistic but fictional *clearly labeled* copy (not a fabricated personal claim).

## Step 6 — Review and document
Run Penpot prototype in View mode; check interactions and content hierarchy on mobile and desktop.
Capture comments, approved sections and changes needed.
Record actual Penpot project/file URL and prototype URL in this document *after* owner creates them.
Do not invent Penpot links or claim this package was uploaded to Penpot.

## Source of truth
ADR-UI-001 (visual style) + ADR-IA-001 (seven IA decisions) + approved SRS once GitHub reconciliation completed. Wireframes are implementation guidance, not source code.
