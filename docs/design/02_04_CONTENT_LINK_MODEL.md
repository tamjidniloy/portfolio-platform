# Phase 02.4 — Content Model & Internal Link Relationships

**Status:** PROPOSED, NOT DATABASE ERD.** Phase 03 defines final PostgreSQL schema.

## Public hubs and child items
- Home curates featured **published** Projects, Research, Skills, Writing and Career highlights.
- Projects hub -> Project detail (many); category/technology filters derive from actual data.
- Research hub -> Research detail (many) and related Publication records (may be zero per study).
- Writing hub -> Article detail (many).
- About hub -> Experience/Education/Skills/Achievements and approved social/profile links.

## Typed relations
| Source type | Relationship | Target type | UI behavior |
|---|---|---|---|
| Project | uses | Skill | Display chip; optionally link to skills page |
| Project | related-to | Project | Show only if both published |
| Research | has publication | Publication | Show venue, DOI/arXiv if verified; no invented status |
| Research | uses | Dataset/external link | Show only if legitimate accessible link |
| Article | references | Project/Research | Crosslink only when referenced item published |
| Skill | demonstrated-by | Project | Curated related projects rather than proficiency percentages |
| Experience | highlights | Project | Optional attribution with role evidence |
| Profile | exposes | Social/Resume link | Only intentionally public resources |
| Media | attached-to | Project/Research/Article | Alt text or captions where appropriate |

## Visibility invariants
- Related-content lists must filter on each **target** record's publish state.
- Draft items never create sitemap entries, public metadata, related-card links, or visible search results.
- Publication metadata is separate from a research experiment's status.
- The admin can edit taxonomy/ordering within approved constraints; uncontrolled free-form route injection is out of scope.

## Navigation & breadcrumbs
- Project: Home / Work / [project].
- Research: Home / Research / [study].
- Writing: Home / Writing / [article].
- Skills/Experience/Education/Achievements: Home / About / [page].
- Admin: Dashboard / [collection] / [editor] where applicable.

## Intentional decisions deferred
Taxonomy cardinality, DB foreign keys and migrations are Phase 03. Search UX and filter depth depend on actual content volume. Public publication detail pages are not required for Release 1 by default.
