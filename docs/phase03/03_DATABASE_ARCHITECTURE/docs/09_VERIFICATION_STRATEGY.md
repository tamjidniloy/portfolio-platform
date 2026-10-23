# 03.3.9 — Verification and Acceptance Plan

## Static design verification (allowed now)
- Check artifact count and presence, CSV headers/rows and table column dictionary coverage.
- Render Graphviz DOT to SVG/PNG; confirm expected entity names appear in ERD.
- Run basic SQL statement parsing/lint checks; do **not** claim PostgreSQL execution.
- Verify ZIP CRC and SHA256 manifest against extracted files.

## Future runtime tests, no PASS outcomes today
There are **40 additional Phase 03.3 review/verification cases** in `review/QA_REGISTER.csv`; every row is `NOT_RUN` and `Evidence ref=NONE`. Owner/reviewer should assign status only after evidence.

Suggested testing after Phase 04 DB scaffold:
1. Test anonymous SSR/API/search/sitemap never include revisions or PII. Direct unpublished slug returns safe 404.
2. Save draft of a live published item; verify public snapshot remains unchanged until explicit publish.
3. Publish/unpublish under concurrent writes; verify atomic snapshot + outbox + audit, unique canonical path and stable revision.
4. Replay OTP/reset/session, expired tokens and CSRF; ensure no side effects.
5. Fail SMTP/storage/cache worker and Postgres transactions; verify honest feedback and no unapproved public exposure.
6. Apply migration baseline to disposable PG, record test run/version and ensure FK/check/index assertions.
7. Run isolated restore drill and media ACL cleanup test; publish precise evidence, not checkmarks alone.
8. Test valid and invalid JSON payloads for each of 13 proposed content types and revised field specifications after SRS approval.

## Strict evidence separation
- Phase 02 design QA 142 NOT_RUN and native Penpot still unverified.
- Phase 03.2 planned 42 design checks not marked executed by owner approval.
- This Phase 03.3 design artifact is **not** a deployed Postgres DB, tested SQL migration, security audit, WCAG compliance or production backend.
