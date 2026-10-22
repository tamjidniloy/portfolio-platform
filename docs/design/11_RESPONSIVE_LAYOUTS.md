# Phase 02.11 — Responsive Layout Specifications (Public + Admin)

**Status:** PROPOSED FOR OWNER REVIEW; no responsive QA run/verified.
**Date:** 2026-10-23 (Asia/Dhaka).
**Parent approval:** ADR-DS-002 Phase 02.10 component library approved at design-specification level (NOT native Penpot completion).
**Preserve:** ADR-UI-001 dark visual direction; ADR-IA-001 nav; ADR-WF-001/002/003 wireframes; ADR-UX-002 forms; ADR-DS-001 tokens.
**Open:** approved Phase 01 SRS missing from GitHub main; public brand/name and exact font; Penpot native designs/real accessibility tests. Light palette future-only.

## Target widths (CSS pixels — test points, not forced media-query breakpoints)
| Width | Public UI | Admin CMS |
|---|---|---|
| 320 | compact menu, single-column hero/cards, all controls visible | drawer, fields stack, action bar wraps, table alternative |
| 360 | phone narrow | compact readable labels and statuses |
| 390 | mobile design reference, 20px gutters, one-card-per-row | one-column editors; mobile record cards |
| 768 | tablet; adaptive one/two-column only if content fits | sidebar collapses and forms may divide when fit |
| 1024 | small desktop; full nav where it fits | dashboard grid and sidebar as space allows |
| 1440 | desktop reference, max public content ~1248px | sidebar ~240px; independent short fields in two columns |
| 1920 | centered max-width reading region | dashboard tables capped; text doesn't stretch excessively |

Use content-driven breakpoints, CSS Grid/Flex with min-width:0 where needed, fluid text and no fixed large widths at 320. 200% text resize and 1280 wide at 400% zoom are separate manual browser checks. A static 320px SVG does **not** prove reflow.

## Public templates
- Home PUB-01: optional right hero graphic becomes below text or disappears when decorative; CTAs stack on narrow widths; only published featured items.
- Projects PUB-03: desktop card columns → single mobile column; filter chips wrap or become a disclosure.
- Project details PUB-04: technical figures cap width/locally scroll with caption and accessible alternative, no whole-page horizontal scroll.
- Research PUB-05/06: scientific-stage label visible; charts/tables remain understandable with local scroll and text/data alternative; published-only records.
- About/Experience/Education/Skills/Achievements: desktop timeline and grouping → mobile single-column; dates/credentials wrap.
- Writing PUB-11/12: narrow reading width, code scroll scoped within code block; semantic headings/citations.
- Contact PUB-13: stacked labeled fields, submit and error messages not clipped; preserve user input after network error.
- Utility pages: privacy/404 and resume conditional link remain navigable.

## Admin templates
- Login/OTP: inputs support password manager and paste, responsive form container, generic errors.
- Dashboard: real counts only; sidebar becomes drawer; tile grid adapts to width.
- Index/table views: desktop table, mobile labeled record cards (do not hide essential status/actions). Genuinely 2D tables may scroll in a named contained region.
- Editors: 2-column independent short fields desktop, single column on narrow width; long rich text/media full width; sticky action bar may not entirely obscure focused fields.
- Media: keyboard Choose File alternative to drag; gallery adapts and exposes upload error.
- Messages/settings: private details, safe status transitions, clear return navigation.
- Draft preview remains authenticated, noindex/no-store and never appears in public navigation.

## Source of truth
Companion conversation ZIP `DEVFOLIO_Phase02_11_Responsive_A11y_Pack.zip` contains 8 editable SVG layout references, preview, 52 UNEXECUTED test cases and a responsive offline lab. Importing SVGs does not create native Penpot responsive constraints or real application behavior.
