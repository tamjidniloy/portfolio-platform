# Phase 02.12 — Penpot Interaction Design Setup

**Status:** INSTRUCTIONS, NOT executed in user Penpot.
**Companion ZIP:** DEVFOLIO_Phase02_12_Interactions_Pack.zip (eight editable SVG sheets, offline demo, registry and QA).

## Create pages
- `20 — Microinteractions & Motion`
- `21 — Loading, Empty & Error States`

## Boards and flow IDs
| Board / Flow | Prototype intent |
|---|---|
| INT-20-01 Public Header | idle -> menu open -> navigation -> closed |
| INT-20-02 Card | default -> hover/focus -> published detail |
| INT-20-03 Filter | initial -> filtered -> no-results -> clear |
| INT-20-04 Contact | idle -> invalid -> corrected -> sending -> accepted/failure |
| INT-20-05 Admin Table | loading -> records / truly empty / filtered empty / request error |
| INT-20-06 CMS Save | dirty -> saving -> saved draft / failed / conflict |
| INT-20-07 Publish | preview -> invalid / confirm -> publishing -> published / failed |
| INT-20-08 Unpublish | destructive confirm -> cancel or server-confirmed action |
| INT-20-09 Media | picker -> upload -> accepted / rejected -> retry |
| INT-20-10 Session | login -> email challenge -> dashboard / expired -> reauth |
| INT-20-11 Motion | normal -> prefers-reduced-motion equivalent without lost information |
| INT-20-12 Mobile | public/admin drawer + action bars at 390/320 CSS px |

## Steps
1. Back up the current Penpot file's existing components/tokens.
2. Import the SVG reference sheets onto their matching pages. SVG import provides vector content ONLY.
3. Use existing dark token set from Phase 02.9 (if actually imported); light remains inactive.
4. Create native boards and component instances, not just one static artboard; name variants State/Intent/Size where needed.
5. Connect overlays, navigation and conditional branches in Prototype mode. Include the failure paths, cancellation and focus notes.
6. For example, Save Draft has different boards for Saving, Confirmed Saved and Save Failed; a prototype **simulates** server outcomes.
7. Annotate focus entry/return, keyboard activation, error summary target, aria-live recommendation and reduced-motion alternative.
8. Test the prototype in View mode, then document real Penpot URLs and which flows were manually checked. **No tests in this pack are marked passed.**
9. Use these patterns across existing PUB/ADM wireframes; avoid duplicating a separate component system.

## Avoid false completion claims
- A Penpot prototype cannot persist PostgreSQL changes, authenticate, publish, or establish WCAG conformance.
- Offline HTML component demo is a simulation; no backend/API calls or actual file uploads.
- Runtime validation and schema limits await authoritative SRS reconciliation.

## Planned implementation libraries (Phase 04+, JavaScript)
shadcn/ui and Radix accessible primitives, React Router, react-hook-form/Zod, TanStack Table, Tiptap, react-dropzone, lucide-react; Motion optional only when useful. No npm installation now.
