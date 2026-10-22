# Phase 02.14 — Portable Asset Manifest

**Companion complete handoff download:** `DEVFOLIO_Phase02_14_Final_Design_Handoff.zip` (provided in the project conversation; GitHub PR does not embed the binary archive).

## Contents
- Offline browsable `INDEX.html` with preview links
- All 12 previous design ZIP source packs under `previous_phase_packs/`, integrity verified
- Phase 02.13 connected local `prototype/CONNECTED_BROWSER_DEMO.html`
- Selected desktop/mobile/editor/design-system PNG previews
- `qa/MASTER_QA_REGISTER.csv` and `.json`: **142 cases, all NOT_RUN**
- `qa/ARCHIVE_INTEGRITY_AUDIT.json`: per-archive entry counts and SHA256
- `qa/13_OFFLINE_DEMO_SMOKE_REPORT.json`: limited offline-only smoke results
- `qa/PENPOT_CONNECTIONS.csv` and `qa/HIFI_SCREEN_MANIFEST.json`
- `MANIFEST_SHA256.csv` for individual handoff files
- All final review, risk, traceability and Phase 03 handoff documents

## Validation at packaging
- Archive ZIP integrity: PASS, both previous assets (12 packs) and final combined ZIP.
- Hi-fi desktop+mobile SVG source count: 36.
- Consolidated case total: 52 + 42 + 48 = 142; all NOT_RUN.
- No Penpot account edits or fully operational authentication/publishing represented.
- Large binary files are supplied as conversation downloads rather than blindly committed as large GitHub blobs.

## Important
Do not mistake the self-contained offline HTML prototype or file-presence validation for the completion of native Penpot design, WCAG conformance, functional tests or backend application.
