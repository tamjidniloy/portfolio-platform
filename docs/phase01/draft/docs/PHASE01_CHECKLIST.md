# Phase 01 — Execution and Sign-off Checklist

## 01.1 Establish requirements directory
- [ ] Confirm `docs/` is present locally and tracked on GitHub.
- [ ] Add Phase 01 draft documents without overwriting previously edited files.
- [ ] Update `docs/PROJECT_STATUS.md` to Phase 01 in progress.

## 01.2 Project identity, scope and audiences
- [ ] Review `PROJECT_BRIEF.md` with actual owner goals.
- [ ] Confirm user types and primary tasks.
- [ ] Approve Release 1 versus later scope.

## 01.3 Site architecture and content inventory
- [ ] Confirm `PAGE_INVENTORY.md` routes and content.
- [ ] Inventory real projects, research, experience, education and credentials.
- [ ] Specify public/hidden data for every category.

## 01.4 Admin CMS contract
- [ ] Review each field in `CONTENT_FIELDS.md`.
- [ ] Confirm conditional required fields and validation.
- [ ] Approve draft -> preview -> publish -> archive behavior.
- [ ] Confirm deletion, revisions and URL redirects.

## 01.5 Security and non-functional scope
- [ ] Confirm sole-admin authentication, recovery and session requirements.
- [ ] Confirm privacy, contact retention and media-upload policies.
- [ ] Confirm accessibility, performance, SEO and recovery targets.

## 01.6 Traceability and testability
- [ ] Give each requirement unique stable ID.
- [ ] Review `USER_STORIES.md` and scenarios.
- [ ] Ensure each P0 requirement has acceptance tests or explicit planned test additions.
- [ ] Resolve conflicting or vague requirements.

## 01.7 Package reuse decision
- [ ] Record which functions are off-the-shelf and which require custom domain logic.
- [ ] Defer installations/versions until Phase 03/04 compatibility check.

## 01.8 Approval and commit
- [ ] Resolve all critical items in `OPEN_DECISIONS.md`.
- [ ] Set SRS status to Approved v1.0 with date.
- [ ] Update project status and changelog.
- [ ] Run `git diff --check`, inspect staged docs and commit/push.

## End-of-phase acceptance
Owner can point to a requirement ID, user story, admin form field, expected page behavior and acceptance test for each essential feature. No application code has been written for Phase 01.