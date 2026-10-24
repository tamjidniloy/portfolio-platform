# Phase 02.14 — Native Penpot Design/Prototype Handoff

**Status:** IMPORTABLE DESIGN SOURCE READY; native Penpot boards/prototypes NOT CREATED OR VERIFIED BY ASSISTANT.
**Actual design file:** `DEVFOLIO OS — Public + Admin UI` (owner-controlled; no Penpot connector or file URL available).

## What to import
1. Extract `DEVFOLIO_Phase02_14_Final_Design_Handoff.zip`.
2. Find previous design archives under `previous_phase_packs/`; begin with `DEVFOLIO_Phase02_13_HiFi_Prototype_Pack.zip`.
3. Import 36 editable SVGs into the existing Penpot file as **vector references** (18 screen types × desktop 1440/mobile 390).
4. Restore/activate approved dark semantic tokens from Phase 02.9. Light remains inactive/future-only.
5. Build native Penpot Flex/Grid boards, main components and variants. Imported SVG does **not** automatically create responsive constraints or working prototype connections.

## Proposed native pages
`22 — High-Fidelity Public`, `23 — High-Fidelity Admin`, with prior pages `14 — Design System Foundations`, `15/16 — Component Library`, `17 — Interaction States`, `18 — Responsive Layouts`, `19 — Accessibility & Error States`, `20 — Microinteractions` and `21 — Loading, Empty & Error States`. Preserve existing file pages; don't overwrite them based on documentation naming.

## Flow starting points
- Recruiter: PUB-01 → PUB-03 → PUB-04 → PUB-02 → PUB-13.
- Engineering reviewer: PUB-03 → PUB-04 → legitimate external code/demo (only if real).
- Research collaborator: PUB-05 → PUB-06 → verified reference/Contact.
- Contact: PUB-13 → validation failed/recovered → server-accepted feedback simulation.
- Owner: ADM-01 → ADM-02 → ADM-05 → ADM-07 → ADM-08 → ADM-29 → publish confirmation → server-confirmed result in future app.
- Error/recovery: invalid code, expired session, rejected media upload, stale revision, no-results/empty collection, publish denied/cancelled.

## Link-map data
The handoff ZIP has `qa/PENPOT_CONNECTIONS.csv` (25 source-trigger-destination intentions). It is a worklist rather than a verified native Penpot connection list.

## Acceptance evidence to collect
Actual Penpot file URL, per-flow View-mode link and recording/notes, reviewer, date, desktop/mobile/native responsive screenshots, component-instance audit, return focus and error-state annotations. Record results in the QA register. **No URL is invented.**

## Restrictions
No actual authentication/data storage/security controls exist in the standalone prototype. Do not treat a simulated Publish transition as a real CMS operation. Exact font, brand and approved SRS remain unresolved.
