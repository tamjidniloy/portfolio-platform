# DEVFOLIO OS — Phase 01 Requirements Engineering Recovery

**Status: HISTORICAL DRAFT PACK RECOVERED; AUTHORITATIVE APPROVED SRS STILL UNVERIFIED.**
**Date:** 2026-10-23 (Asia/Dhaka).
**PR purpose:** Restore full Phase 01 requirements engineering source files under a draft namespace and provide a review trail without promoting an older SRS draft to approved status.

## What's been recovered
Two original local deliverables (both ZIP integrity checks passed):
- `DEVFOLIO_Phase01_Requirements_Pack.zip` — original ten-file requirements package.
- `DEVFOLIO_Phase01_Kickoff_Reviewed.zip` — subsequent reviewed kickoff package containing 12 files, including project status and original materials.

The **complete owner-downloadable recovery bundle**, `DEVFOLIO_OS_Phase_01_Complete_Requirements_Engineering.zip`, is available in the project conversation. It contains both archives intact, an extracted draft, traceability CSVs, proposed gap tests, Phase 02 change review and approval instructions. This PR branch will receive the same source files when the archive upload helper is run.

## Requirements inventory from historical baseline
- **52** draft functional requirements (`FR-001..052`)
- **24** draft nonfunctional requirements (`NFR-001..024`)
- **43** original acceptance-test cases (`AT-001..043`)
- **58** requirements explicitly mentioned in at least one original test mapping
- **18** catalog entries without an explicit matching test ID, with 18 additional **proposed, unexecuted** test cases prepared in the local handoff ZIP

The original SRS clearly states **Version: 1.0 Draft / Last reviewed: Not approved**, and its final approval section says approval was not yet granted. The project owner has described Phase 01 as approved, but a distinguishable signed-off source revision has **not** been located in the available files or GitHub. **Do not relabel the old draft as approved.**

## Scope
The historical SRS covers public SSR portfolio and a private owner-only CMS; JavaScript/React/Node/Express/PostgreSQL; real portfolio/research content; media and revisions; draft/preview/publish; password plus email challenge; no draft leakage; technical SEO; privacy; backups; WCAG target and performance targets. All field limits/provider/route specifics remain candidate requirements until source reconciliation.

## Files expected after running upload helper
- `docs/phase01/draft/docs/SRS.md`
- `docs/phase01/draft/docs/REQUIREMENTS_CATALOG.md`
- `docs/phase01/draft/docs/CONTENT_FIELDS.md`
- `docs/phase01/draft/docs/PAGE_INVENTORY.md`
- `docs/phase01/draft/docs/USER_STORIES.md`
- `docs/phase01/draft/docs/ACCEPTANCE_TESTS.md`
- `docs/phase01/draft/docs/OPEN_DECISIONS.md`
- `docs/phase01/draft/docs/PHASE01_CHECKLIST.md`
- `docs/phase01/draft/docs/PROJECT_BRIEF.md`
- `docs/phase01/draft/docs/PROJECT_STATUS.md`
- `docs/phase01/traceability/*.csv` plus original ZIP archives.

## Current GitHub state and next action
The current project `main` has `docs/phase01/SRS_RECONCILIATION.md`, not the authoritative approved SRS. Download the complete Phase 01 ZIP and run `docs/phase01/tools/upload-phase01-source.ps1` from Windows PowerShell to add exact original files to **this same PR branch**. See `SOURCE_UPLOAD_STATUS.md`.

## Outstanding decision
Recover the actual owner-approved SRS OR explicitly review/approve the reconciled candidate and record exact version/date/sign-off and commit SHA. Update `SRS_RECONCILIATION.md`, then check Phase 02 against the approved SRS. No automatic design or QA pass is implied.
