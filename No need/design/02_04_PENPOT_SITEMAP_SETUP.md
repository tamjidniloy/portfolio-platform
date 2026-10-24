# Phase 02.4 — Penpot Information Architecture Setup

**Status:** READY TO IMPORT AS DESIGN REFERENCE; interactive navigation boards require manual authoring.

## Create a page
In the Penpot file 'DEVFOLIO OS — Public + Admin UI', create a page `09 — IA & Navigation`.

## Place references
- Import optional `public_sitemap.svg` and `admin_sitemap.svg` as editable vector references (companion ZIP).
- Keep public and admin sitemap diagrams on separate boards.
- Add a third board named `Navigation Spec` with desktop header, mobile drawer, breadcrumbs and footer relationships.

## Prototype board mapping
Use PUB-01…16 and ADM-01…30 screen IDs from `04_SCREEN_INVENTORY.md`. These screen IDs are **stable labels**, not literal router names. A simple content editor may be a dialog instead of a separate board if its interaction is documented.

## Draw the proposed public menu
- Brand -> Home
- Work -> Projects
- Research -> Research
- About -> About
- Writing -> Writing (conditional when published)
- Contact -> Contact (prominent CTA)
- Background pages, Resume, Privacy -> About contextual links/footer where applicable

## Draw admin navigation
- Overview: Dashboard
- Content: Profile, Projects, Research, Publications, Writing
- Background: Experience, Education, Skills, Achievements, Open Source
- Assets: Media, Resume
- Communication: Messages
- Settings: Site Settings, SEO, Security

## Prototype tests
1. Recruiter: Home -> Work -> Case Study -> About / Resume -> Contact.
2. Research collaborator: Research -> Study -> related paper/Contact.
3. Writer/reader: Writing -> Article -> related project.
4. Admin: Login -> Email Challenge -> Dashboard -> Project list -> Editor -> Preview -> Publish -> public page.
5. Mobile: Menu opens, link navigates, active link updates, drawer closes, focus returns; fallback keyboard paths.
6. Unpublished detail: 404 screen, not a tempting inaccessible draft snippet.
7. Incomplete content: hide nav/card to nonexistent resources without creating dead ends.

## Decisions to capture before approval
- Show/hide Writing tab based on published content?
- Should empty optional hubs remain as 200/noindex or be removed from sitemap?
- Is Research+publications combined public hub accepted?
- Are About background routes preferred over anchor-only navigation?
- Should owner be able to reorder only a whitelist of menu items?

## Reminder
SVG sitemap files are diagram references. Importing an SVG does **not** create a functional Penpot prototype. Connect the actual page boards in Penpot's Prototype mode.
