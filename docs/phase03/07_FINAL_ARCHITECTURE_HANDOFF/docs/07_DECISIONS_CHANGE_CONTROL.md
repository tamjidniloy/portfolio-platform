# 03.7.7 — Decision, Approval and Change-Control Protocol

## Existing binding design scope
Phase03.2 was **explicitly owner-approved at design-specification level only** (ADR-ARCH-032). This is approval of the logical component model, ports, dependency rules and security/publication architecture direction; not application implementation or final schema/API approval.

Phase02 visual/IA/design-system ADRs were approved **at their stated design scope**, including dark-first tokens, conditional Writing, research stage truthfulness and permitted navigation. Native Penpot files, final accessibility tests and production UI implementation were not approved or verified.

## Unapproved milestones and final technical options
Phase03.1, 03.3–03.6 and this 03.7 package are *authored proposals/handoffs* unless a separate exact owner acceptance record exists. The SRS v1.1 document and Phase03 database/API designs remain candidates. The fact that a PR was merged or that 7 original ZIPs pass checksums does not grant technical acceptance.

## Decision protocol for a disputed contract
1. Identify requirement ID, source files and conflicting ADRs.
2. Write alternatives and impact to security, DB/API, UI, tests, migration and rollback.
3. Obtain explicit owner approval of exact wording/priority and list accepted exceptions.
4. Record approval date, decision maker and Git SHA in a canonical review note.
5. Update requirements, traceability, tests and downstream ADRs in the same reviewed workflow.
6. Keep unexecuted test statuses NOT_RUN until evidence exists.

## Merge protocol
1. PR #31 merges 03.5–03.6 sources to main; review its diff and any branch divergence.
2. The Phase03.7 integration PR is stacked on the 03.6 branch until #31 is merged, then retargeted to `main`.
3. Merge decisions and final technical freeze **only after** explicit signoff; a documentation sync PR can merge as archival documentation with gates clearly open.
4. Verify `main` tree and archive/checksum after merge.
