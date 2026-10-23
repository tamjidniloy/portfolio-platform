# 03.7.9 — Requirement/Test Coverage and Evidence Ledger

- **Phase01 historic catalog:** 52 FR and 24 NFR = **76** stable IDs; review the v1.1 candidate exact wording/priority before binding design. FR-034 theme setting was proposed for P2 deferral; no automatic approval.
- **Historical Phase01 AT:** 43 original acceptance tests; 18 catalog rows initially lacked direct explicit AT mapping. Additional suggested ATs are not executed.
- **Phase02:** 142 design/a11y/prototype checks, all NOT_RUN in published Phase02 handoff. A real functioning app is required for many browser/assistive-tech checks.
- **Phase03.2:** 42 candidate review cases; **Phase03.3:** 40; **03.4:** 60; **03.5:** 80; **03.6:** 96 — **318** total planned QA cases in source registers, NOT_RUN.
- **Phase03.7:** 50 additional handoff review cases, all NOT_RUN. These are planning cases; no execution occurred.

### Evidence acceptance states
`NOT_RUN` -> actual execution with actor/date/environment/commit+build SHA -> `PASS` or `FAIL` or `BLOCKED` -> reviewed defect and residual-risk acceptance. **Never derive PASS from static schema validation or ZIP checksum**.

### Minimum future negative cases
Anonymous accesses to draft/public APIs, stale CDN unpublish, unauthorized admin DTO reads, reused OTP, stale If-Match, CSRF, upload forged MIME, deletion with linked media, provider email failure, backup restore, session expiry, xss-rich-text and keyboard/screen reader regression.

### Source integrity vs test results
ZIP hash checks, JSON schema structure parsing and Graphviz rendering validate the **handoff package**, not actual production behavior. Tracked QA statuses remain as written in the original check registries.
