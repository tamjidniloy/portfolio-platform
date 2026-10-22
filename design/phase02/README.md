# DEVFOLIO OS — Phase 02.00–02.14 GitHub Asset Handoff

**Status:** Phase 02 documentation is synchronized on this PR branch. Several original text/vector/browser assets are checked in. The large **50.84 MiB master ZIP itself is NOT YET UPLOADED TO GITHUB**; use the attached Windows upload script and the already-created master archive from the ChatGPT conversation to add it by Git LFS. Do not mark a binary upload complete until GitHub shows the LFS pointer and actual download succeeds.

## Main PR goal
Synchronize the 10 missing Phase 02.14 documents from the previously merged intermediate handoff branch into default `main` through a PR, alongside useful original, directly viewable sources.

## Original sources already committed here
- `prototype/CONNECTED_BROWSER_DEMO.html`: original offline connected Phase 02.13 browser demo; it is **simulation**, not running portfolio/CMS.
- `prototype/interaction_lab.html`, `responsive_lab.html`, `interactive-component-lab.html`: static, self-contained demo files.
- `tokens/penpot-token-sets.json`: original Penpot semantic design tokens. Dark mode approved; light set future-ready only.
- `css/devfolio-tokens.css`: design CSS token reference.
- `references/Design_System_Dark.svg`, `03_publishing.svg`, `public_sitemap.svg`, `admin_sitemap.svg`: original editable vector samples.
- `qa/MASTER_QA_REGISTER.csv`: 142 design/a11y/hi-fi planned cases, all NOT_RUN.
- `qa/MASTER_ARCHIVE_MANIFEST_SHA256.csv`: original per-file master bundle hash list.
- `qa/GITHUB_AUTHORED_DOCUMENT_INDEX.csv`: links/index of authored design docs.

**Note:** A GitHub raw HTML file may need to be downloaded and opened locally for its JavaScript to run. HTML prototype is for design preview only, not production security or functionality.

## Canonical complete master archive
File name: `DEVFOLIO_OS_Phase_02_00_to_02_14_COMPLETE_MASTER.zip`

- Exact source byte count: **53,312,288** (50.84 MiB)
- SHA-256: `3a7d0432f2d3c494dd1fec755d9929d040e814a575d00a9578a8d3db30391869`
- Archive integrity check: PASS
- Contains 15 phase folders, 14 original preserved phase ZIPs, 898 members (including nested original packs). Actual native Penpot file is **not** included because no native Penpot file was created or retrieved.
- The existing master archive is available for download in the ChatGPT project conversation. **It has not been uploaded to this GitHub branch by this connector.**

### Upload the master ZIP to this same PR branch (Windows 11)
1. Download the master ZIP from the project conversation to your Windows Downloads folder.
2. Ensure [Git for Windows](https://git-scm.com/downloads/win) and [Git LFS](https://git-lfs.com/) are installed, and GitHub authentication is configured for your account.
3. Download `tools/upload-phase02-master.ps1` from this PR and run it in PowerShell:
   ```powershell
   .\upload-phase02-master.ps1 -ArchivePath "$HOME\Downloads\DEVFOLIO_OS_Phase_02_00_to_02_14_COMPLETE_MASTER.zip"
   ```
4. The script verifies SHA-256 and size, clones this feature branch in a fresh folder, adds the archive through Git LFS, commits it, and pushes it onto the existing PR branch.
5. Verify `design/phase02/archive/DEVFOLIO_OS_Phase_02_00_to_02_14_COMPLETE_MASTER.zip` exists on GitHub with LFS storage and that downloading returns the exact SHA above.

GitHub regular Git warns at >50MB; Git LFS is the appropriate way to store this specific asset in the repo, subject to your GitHub LFS quota. If storage costs or quota make LFS inappropriate, attach the archive to a GitHub release using the GitHub web interface instead, and edit this README with the verified release asset URL and SHA. Do not create a broken Git LFS pointer by hand.

## Outstanding non-asset gates
- Owner-approved Phase 01 SRS on GitHub main: MISSING. The historic draft is not a substitute.
- Native Penpot main components/connected prototype: NOT VERIFIED.
- 142 design/QA test cases: NOT RUN. No WCAG conformance claim.
- Public brand/name and exact font: OPEN. Release 1 light theme: not approved, future-ready only.

A documentation/asset synchronization PR is **not** evidence of real React app implementation, functional CMS backend, or full acceptance of Phase 02 external gates.
