# Phase 02.14 — GitHub PR Review / Merge Guide

**Repo:** https://github.com/tamjidniloy/portfolio-platform
**Parent:** [Phase 02.13 PR #13](https://github.com/tamjidniloy/portfolio-platform/pull/13); open draft at Phase 02.14 preparation.
**This PR base:** `docs/phase02-hifi-prototypes-20261023`; **head:** `docs/phase02-final-handoff-20261023`.

Earlier PRs #2/#3/#4/#6/#7/#8/#11/#12 were marked **merged**, but several were merged into intermediate branches. **Merged does not mean all their content exists on `main`**.

## Review sequence
1. Review Phase 02.13 hi-fi source and offline prototype in the companion handoff ZIP.
2. Review this Phase 02.14 PR, especially the QA blockers and SRS traceability.
3. Confirm whether to merge #13 first and then this PR, or rebase each stacked branch in a controlled order.
4. Inspect actual files on `main` after merging; do not infer propagation from intermediate merged labels.
5. Do not reclassify old Phase 01 `SRS.md` draft as approved, do not merge secrets.
6. Keep master QA cases NOT_RUN until execution/evidence exists.
7. Record the final Penpot URLs, approved SRS commit and accessibility verification before writing `Phase 02 = complete`.

## Windows PowerShell
```powershell
cd "$HOME\Dev\portfolio-platform"
git status
git fetch origin
git log --oneline --all -15
```

No local developer checkout was modified by ChatGPT during this design handoff; GitHub documentation was written to a review branch.
