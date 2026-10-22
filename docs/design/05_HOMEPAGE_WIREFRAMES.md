# Phase 02.5 — Homepage Wireframes (PUB-01)

**Status:** DRAFT for owner review, not approved or implemented
**Updated:** 2026-10-23
**Parent:** ADR-UI-001 (approved visual direction) and ADR-IA-001 (seven approved information-architecture decisions)
**Dependency:** Phase 01 owner-approved SRS has not yet been synchronized to GitHub; do not declare final design sign-off.
**Artifact:** Companion editable SVG + PNG pack provided with the project conversation (desktop 1440, tablet 768, mobile 390, sparse-content desktop).

## Design objective
A credible, evidence-led homepage that immediately identifies the owner as a software developer and AI/ML researcher, and helps recruiters, engineers and collaborators reach **published proof** quickly. Provide prominent Work, Research, About and Contact paths without decorative overload.

## Art direction inherited unchanged
- Dark navy surfaces, muted teal/blue accents; light mode not required for this wireframe.
- Large editorial sans-serif display type, sparing uppercase technical labels and optional mono accents.
- Compact structured case-study cards; whitespace and consistent grid.
- Actual final brand/name and font family are **OPEN**; use generic editable placeholders.
- No fake metrics, credentials, projects, research acceptance or employment history.

## Homepage information hierarchy — public screen PUB-01
| Section ID | Title | Priority | Data source / condition | Primary action |
|---|---|---|---|---|
| HOME-01 | Header / navigation | Always | Approved whitelisted nav routes; Writing conditional | Brand -> Home; Work, Research, About, conditional Writing, Contact |
| HOME-02 | Hero | Always | Published profile headline and short introduction | Explore projects; Research/Contact fallback |
| HOME-03 | Featured engineering | Conditional | 0..N featured **published** project records | /projects and /projects/:slug |
| HOME-04 | Research & experiments | Conditional | 0..N featured **published** research records; truthful science stage | /research and /research/:slug |
| HOME-05 | Technical expertise | Conditional | Approved/visible skill groups with links to evidence | /skills, related published work |
| HOME-06 | About / career / education | Conditional sections inside always-accessible About path | Approved public background fields | /about, /experience, /education |
| HOME-07 | Writing / achievements | Optional | Only published writing and real accomplishments | /writing and /achievements |
| HOME-08 | Contact CTA | Always | Contact settings and public form availability | /contact |
| HOME-09 | Footer | Always | Approved social/navigation/legal links | Relevant permanent pages, /privacy where necessary |

## Desktop PUB-01 / 1440
- Artboard 1440px wide; nominal max content area 1248px; side gutters 96px.
- Header approx 88px high; brand left, Work/Research/About/conditional Writing/Contact right.
- Hero: two columns, narrative width ~680px and secondary abstract technical diagram on the right. Avoid compulsory portrait/3D graphics.
- Hero typography in the low-60px range for concept only; two short lines; intro ~17px; CTAs side by side.
- Selected work: two large evidence-focused project cards in 2-column grid, each with cover diagram/media, actual title, short role/implementation summary and tech chips.
- Research: horizontal evidence rows with study status, methods and links; do not label unreviewed experiment a formal paper.
- Skills: grouped columns Software / Research / Systems reflecting real skill inventory.
- Background: short authentic story and links to actual experience and education.
- Optional published writing/awards slot (show only with content).
- Contact invitation and compact footer.

## Tablet PUB-01 / 768
- Side gutters approx 42px.
- Prioritize readable editorial hero; decorative right-side figure **hidden** in wireframe to avoid title overlap.
- Two compact project cards where width allows, but this is design guidance, not a fixed CSS breakpoint rule.
- Research rows remain readable; skills appear as three compact columns or can stack where content length demands.
- CTA labels must not clip and no horizontal page overflow.

## Mobile PUB-01 / 390
- Side gutters 20px; compact brand and visible menu control.
- Hero becomes 1 column; editorial display reduced to ~39px; CTAs stack full width.
- Optional technical abstract appears after hero copy, not alongside headline.
- One project card per row; media remains paired with title, summary, chip list and link.
- One research card per row; study status always visible.
- Skill groups stack; background summary precedes contact.
- Contact CTA spans content width; footer links wrap without overflow.
- Menu opens as accessible overlay/drawer; has Escape/close/backdrop behavior and focus restoration, which must be prototyped separately.

## Sparse content variant
- If no published projects or research items exist, **do not** show empty featured blocks, fake example cards or false stats on the live site.
- Show truthful profile/introduction, background/interests if available, direct contact and optional safe navigation paths.
- Public collection URLs may show their own approved empty state; homepage can omit teasers.
- Remove Writing tab when no published articles; omit Resume link if no public PDF.

## Publication / SEO / safety invariants
- Only published records may populate homepage cards, featured lists, metadata or related links.
- Page headings and previews are grounded in actual approved profile data; placeholders in SVG are deliberately brackets.
- If new project content is published in CMS, homepage updates without application redeployment.
- No public route should expose draft, archived, private preview or unpublished media.
- Banner text should not claim verified deliverables not present in the database.

## Interaction mapping for Penpot and later implementation
| Target element | Intent | Destination / action |
|---|---|---|
| Brand | Return to start | PUB-01 `/` |
| Work | Explore projects | PUB-03 `/projects` |
| Research | Explore studies | PUB-05 `/research` |
| About | Professional identity | PUB-02 `/about` |
| Writing (conditional) | Articles | PUB-11 `/writing` |
| Contact / Get in touch | Collaboration | PUB-13 `/contact` |
| Featured project card | Deep read | PUB-04 `/projects/:slug` (published record) |
| Research card | Deep read | PUB-06 `/research/:slug` (published record) |
| About/career links | Verified background | PUB-02/PUB-07/PUB-08 |
| Technology group link | Skills | PUB-09 `/skills` |
| Mobile menu control | Reveal navigation | UI overlay (not new public URL) |

## Wireframe acceptance criteria
1. Correct primary navigation and conditional Writing/Resume logic (ADR-IA-001).
2. Clear software developer + AI/ML researcher introduction without false claims.
3. Featured projects and research are actual published data only, not compulsory.
4. Desktop, 768px tablet and 390px mobile compositions preserve reading hierarchy and touch targets.
5. Mobile menu/back/close/focus behavior defined; key links prototype to matching Penpot boards.
6. Honest sparse-content state and public error paths.
7. No text/card collisions, clipped buttons, decorative loading screen or artificial skills scores.
8. Owner review required for final hero copy, section spacing, editorial balance and number of featured items.
9. Approved Phase 01 SRS traced to sections before Phase 02 exit.
