# DEVFOLIO OS — Phase 01 Kickoff (Steps 01.1 and 01.2)

This is a review-ready version of the previously provided Requirements Pack. It contains all nine original requirements documents (with a refined **Draft** project brief), plus `docs/PROJECT_STATUS.md` and `.gitignore` to complete the baseline. It does **not** include `README.md` because your GitHub repository already has one. It does not install application code.

## Before copying — important
1. The connected GitHub repo `tamjidniloy/portfolio-platform` is **private** on `main`.
2. At the time of inspection, `README.md` exists but `.gitignore`, `docs/PROJECT_BRIEF.md`, `docs/PROJECT_STATUS.md`, and `docs/SRS.md` were not found remotely.
3. Check your local `docs/` and `.gitignore` first. **Do not overwrite a locally edited file.** Compare differences or copy only missing documents.
4. This archive includes `docs/PROJECT_BRIEF.md` marked DRAFT. No approval is being claimed.

## Windows 11 steps
1. Download and extract this zip to a separate folder (not inside the repository).
2. In PowerShell: `cd "$HOME\Dev\portfolio-platform"; git status; Get-ChildItem -Force; if (Test-Path .\docs) {Get-ChildItem .\docs}`
3. If your working tree contains uncommitted changes, review and save them before importing.
4. Copy **missing** files from the extracted `docs/` folder into `<repo>/docs/`. If a file exists, compare it in VS Code before selecting which content to keep.
5. Copy the provided `.gitignore` **only if you do not have one**, otherwise merge the ignore rules into the existing file.
6. Open `docs/PROJECT_BRIEF.md` in VS Code. Review its vision, audience, release scope, exclusions, and approval checklist; keep it Draft until explicitly approved.
7. Run `git status`, `git diff --check`, `git add docs .gitignore`, `git diff --cached --stat`, `git diff --cached --check` to inspect what would be committed.
8. Once happy, run `git commit -m "docs: add phase 01 requirements drafts"` and `git push origin main`. Do not label the SRS as approved yet.

## Review sequence
1. `docs/PROJECT_BRIEF.md` — Step 01.2
2. `docs/OPEN_DECISIONS.md` — record remaining choices
3. `docs/PAGE_INVENTORY.md` — subsequent scope review
4. `docs/CONTENT_FIELDS.md` — subsequent CMS field review
5. `docs/REQUIREMENTS_CATALOG.md`, `docs/USER_STORIES.md`, `docs/ACCEPTANCE_TESTS.md`, `docs/SRS.md` — further engineering review

**No npm commands are needed for requirements engineering.** Install packages only when the architecture and compatible versions are approved.