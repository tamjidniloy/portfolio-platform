# Phase 02.6 — Penpot Editable Page Templates: Implementation Procedure

**Status:** DESIGN REFERENCE PREPARED; actual Penpot file not modified by ChatGPT.
**Design:** ADR-UI-001 + ADR-IA-001 + ADR-WF-001; exact font/brand open.

## Setup on Windows 11
1. Download `DEVFOLIO_Phase02_06_Public_Page_Templates.zip` from the ChatGPT project conversation.
2. Extract to a temporary folder; inspect `README_START_HERE.md`, `desktop_overview.png`, `mobile_overview.png`, and `assets/`.
3. Open your existing Penpot design file **DEVFOLIO OS — Public + Admin UI**.
4. Add a page `11 — Public Page Templates`. Create functional sections: Collections, Details, About & Background, Writing, Contact & Utilities.
5. Import desired SVG from `assets/` (drag/drop or paste vector). SVGs are editable vector references; this does not automatically make responsive native Penpot frames or working click interactions.
6. For each published screen ID in `04_SCREEN_INVENTORY.md`, create a native board with the ID and route in its name. For desktop reference 1440px and selected mobile reference 390px.
7. Recreate reusable regions as Penpot components: site navigation, breadcrumb, hero, section heading, project/research card, study stage, timeline item, rich article figure, form input, footer.
8. Apply native Flex Layout for text+control stacks and Grid Layout for card collections. Use semantic layer names and consistent constraints rather than visually-positioned unstructured rectangles.
9. Compare both widths and verify 320px reflow, long title wrapping, accessibility, focus and mobile nav states.
10. In Prototype mode, link an actionable layer to its destination board; verify with Penpot View mode.

## Board plan and ID mapping
| Group | Boards |
|---|---|
| Profile | PUB-02 /about desktop and mobile |
| Engineering | PUB-03 projects index; PUB-04 project detail |
| Research | PUB-05 research index; PUB-06 study detail |
| Background | PUB-07 experience, PUB-08 education, PUB-09 skills, PUB-10 achievements |
| Writing | PUB-11 writing index; PUB-12 article detail |
| Contact | PUB-13 contact, Contact-invalid, Contact-sending, Contact-success, Contact-server-error |
| Utility | PUB-14 privacy, PUB-15 not-found, PUB-16 public-resume-state |
| Crosscutting | Empty projects/research, Mobile-nav-open, Detail-missing, Related-link-unavailable |

## Prototype navigation
- Brand -> PUB-01 Home.
- Work -> PUB-03 -> PUB-04.
- Research -> PUB-05 -> PUB-06.
- About -> PUB-02 -> PUB-07/08/09/10.
- Writing -> PUB-11 -> PUB-12, only when published articles exist.
- Contact CTA -> PUB-13 -> inline success/error variants.
- Breadcrumb detail -> parent collection or About.
- Missing/unpublished -> PUB-15 with correct real implementation status later.
- Resume CTA -> verified public PDF only; no always-on link.

## Asset layout
Use SVG source files from ZIP and their PNGs for visual comparison. Do not mistake ordinary archive ZIP for a native Penpot `.penpot` file. No real Penpot project URL has been provided or created here.

## Engineering handoff
The final design team should export actual Penpot project/share link, approved boards, tokens, component list, accessibility annotations, content mapping and main user-flow links. React/Tailwind/shadcn integration happens during Phase 04+ and should use maintained compatible versions.
