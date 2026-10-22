# Penpot Flow Design — Phase 02.3

**Status:** PREPARED FOR MANUAL PENPOT SETUP; not an existing Penpot project.
**Tool:** Penpot. **Style:** ADR-UI-001.

## Workspace arrangement
In the DEVFOLIO OS — Public + Admin UI design file, create a page named '08 — User Journeys & Flows'. Organize separate named sections / boards for Public, Admin Auth, Admin Content, and Exceptional States.

## Recommended prototype board IDs
| Board ID | Screen |
|---|---|
| PUB-01 | Home |
| PUB-02 | Projects index |
| PUB-03 | Project detail |
| PUB-04 | Research index |
| PUB-05 | Research detail |
| PUB-06 | About / Experience |
| PUB-07 | Contact form |
| PUB-08 | Contact confirmation |
| PUB-09 | Not found / unavailable |
| PUB-10 | Resume download control |
| ADM-01 | Login credentials |
| ADM-02 | One-time email challenge |
| ADM-03 | Dashboard |
| ADM-04 | Content list |
| ADM-05 | Content editor / draft |
| ADM-06 | Private preview |
| ADM-07 | Publish confirmation |
| ADM-08 | Published result |
| ADM-09 | Revisions / restore |
| ADM-10 | Media library |
| ADM-11 | Research editor |
| ADM-12 | Inbox / message |
| ADM-13 | Password recovery |
| ADM-14 | Error / validation state |

## Prototype flows
- F-P01 Recruiter: PUB-01 -> PUB-02 -> PUB-03 -> PUB-06 -> PUB-10 -> PUB-07 -> PUB-08.
- F-P02 Engineer: PUB-01 -> PUB-02 -> PUB-03 -> external source/demo (annotation; do not simulate real repo permissions).
- F-P03 Researcher: PUB-01 -> PUB-04 -> PUB-05 -> PUB-07.
- F-P04 Contact: PUB-07 -> [invalid input remains on form] or PUB-08; network error remains on form with values retained.
- F-A01 Authentication: ADM-01 -> ADM-02 -> ADM-03; incorrect / expired challenge returns error state.
- F-A02 Content publishing: ADM-03 -> ADM-04 -> ADM-05 -> ADM-06 -> ADM-07 -> ADM-08.
- F-A03 Revision lifecycle: ADM-04 -> ADM-05 -> ADM-09 -> ADM-06 -> ADM-07.
- F-A04 Media: ADM-05 -> ADM-10 -> ADM-05; rejected file goes to ADM-14.
- F-A05 Research: ADM-04 -> ADM-11 -> ADM-06 -> ADM-07.
- F-A06 Account recovery: ADM-01 -> ADM-13 -> ADM-01.
- F-A07 Contact inbox: ADM-03 -> ADM-12 -> ADM-03.

## How to assemble interactive screens
1. Create actual Penpot boards for each screen (flowchart SVGs are references, not interactive prototype screens).
2. Draw essential UI controls as layers on each board.
3. In Prototype mode select the trigger layer and connect it to the target board.
4. Add distinct Flow starting points for recruiter, engineer, researcher, login and publishing.
5. Use simple non-distracting transitions; label validation and error states.
6. Test every flow in View mode on representative narrow and desktop frames.
7. Record the real Penpot design file link and prototype URLs in this document; do not invent links.

## SVG flowchart import
The companion package contains editable SVG flowcharts. Import or paste each into a Penpot canvas as a visual reference. Imported SVG is a diagram, not an automatically connected interactive prototype. Recreate screens as boards and set prototype interactions manually.

## Review criteria
Each critical journey has a start, successful end, error route, back navigation, correct role boundary, and link to Phase 01 requirement IDs.
