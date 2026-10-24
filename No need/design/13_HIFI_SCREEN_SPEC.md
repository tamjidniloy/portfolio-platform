# Phase 02.13 — High-Fidelity Public/Admin Screen Specification

**Status:** PROPOSED FOR OWNER REVIEW, NOT APPROVED / NOT NATIVE PENPOT
**Date:** 2026-10-23 (Asia/Dhaka)
**Parent:** ADR-IX-001 Phase 02.12 interaction specification approved, subject to usual constraints.
**Design foundation:** ADR-UI-001, ADR-IA-001, ADR-WF-001/002/003, ADR-UX-002, ADR-DS-001/002, ADR-A11Y-001, ADR-IX-001.
**Unresolved:** Owner-approved Phase 01 SRS not on GitHub main; final public brand and exact font OPEN; light theme FUTURE-READY ONLY, not Release 1.

## Deliverable status
Companion archive `DEVFOLIO_Phase02_13_HiFi_Prototype_Pack.zip` in project conversation contains:
- **36 editable SVG files**, 18 representative screen/interaction concepts at 1440px and 390px.
- Responsive offline browser prototype `prototype/index.html` with connected hash-navigation and simulated error, save, preview, publish, verification, contact and upload flows. It is **NOT** a server-backed or deployed site.
- Contact-sheet PNGs and selected hi-fi browser screenshots.
- Penpot board/connection map CSV, screen manifest, actual local-demo smoke-check report, and 48 unrun Penpot/implementation QA cases.

## Representative screens included
| Design ID | Area | Reference route/template |
|---|---|---|
| PUB-01 | Homepage | / |
| PUB-03 | Project listing | /projects |
| PUB-04 | Project case study | /projects/:slug |
| PUB-05 | Research collection | /research |
| PUB-06 | Research detail | /research/:slug |
| PUB-02 | About | /about |
| PUB-13 | Contact | /contact |
| PUB-404 | Missing/unpublished | HTTP 404 template |
| ADM-01 | Admin login | /admin/login |
| ADM-02 | Email code | /admin/verify |
| ADM-05 | Dashboard | /admin |
| ADM-07 | Projects index | /admin/projects |
| ADM-08 | Project editor | /admin/projects/new and /admin/projects/:id/edit |
| ADM-29 | Private preview | /admin/preview/:type/:id |
| ADM-PUBLISH | Publish confirmation | Overlay, not a public route |
| ADM-22 | Media library | /admin/media |
| ADM-26 | Site settings | /admin/settings |
| ADM-24 | Messages | /admin/messages |

The pack is **representative P0 hi-fi coverage**, not a claim that every PUBLIC (PUB-01..PUB-16) or ADMIN (ADM-01..ADM-30) screen/variant in the approved information architecture has native high-fidelity implementation. Remaining screens are covered at wireframe level and await high-fidelity completion.

## Visual and content
- Use the approved dark semantic HEX palette and spacing/radius scale, not the future-only light palette.
- Modern editorial headings and evidence-led engineering/research layouts; exact font and public brand placeholder not decided.
- Public cards present only real published content in the eventual app; prototype uses bracketed placeholders and a persistent demo banner.
- Research scientific stage independent of CMS draft/published status.
- Admin list/edit/action screens reflect distinct draft/save/private preview/publish/failure states; server confirmation required in implementation.
- Contact/OTP/authentication are simulated only; never use real secrets or personal data in this offline demo.

## Interaction scope
Public prototype: Home -> Work -> case study; Home -> Research -> study; About -> Contact form simulated validation; mobile drawer.
Admin prototype: Login -> Email challenge -> Dashboard -> Projects -> Editor -> Private Preview; Save Draft mock feedback; publish validation and confirmation overlay; Media reject and Settings feedback.

## Verification and limits
Local Chromium smoke checks were completed against the **offline HTML demonstration** at 1440 and 390 widths for key simulated interactions with no observed JS page errors or contact page-wide horizontal overflow. This does **not** verify native Penpot, server access control, complete responsiveness, keyboard trap correctness, screen readers or WCAG conformance. Refer to companion file `docs/OFFLINE_PROTOTYPE_SMOKE_TEST.json`.
Native Penpot designs and clickable connections must be created manually and verified in View mode. No Penpot account integration available.
Final Phase 02 signoff remains blocked by approved SRS reconciliation and native Penpot/QA review.
