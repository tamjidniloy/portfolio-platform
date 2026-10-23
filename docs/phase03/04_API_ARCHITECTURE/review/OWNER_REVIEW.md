# Owner Review — DEVFOLIO OS Phase 03.4 API Contract Design

**STATUS: ALL CHECKBOXES OPEN.** This is a proposal, not an approval record.

- [ ] Accept SSR-first React Router Framework Mode loaders/actions and narrow JSON resource routes (not full public API guarantee).
- [ ] Approve or revise anonymous public JSON exposure and the `/api/v1` version prefix.
- [ ] Approve published-only safe DTO policy and indistinguishable 404 for absent/hidden content.
- [ ] Review owner session, password/email challenge, CSRF/origin, recovery and revocation candidate behavior.
- [ ] Review revision `If-Match` / 428/412 rules and scoped idempotency keys for write retries.
- [ ] Confirm save-draft vs publish validation and private preview/no-store/noindex.
- [ ] Review media staging/finalize, contact stored vs notification delivered and privacy/retention gates.
- [ ] Accept or revise RFC 9457 error envelope, HTTP statuses, cursor and cache behavior.
- [ ] Review each operation in API_OPERATION_INVENTORY.csv and the machine-readable OpenAPI proposal.
- [ ] Review all 60 planned checks. They are **NOT_RUN**; no actual authorization, WCAG or runtime QA has passed.
- [ ] Reconcile with **owner-approved authoritative SRS**, still PENDING, before freezing final API/DB contracts.
- [ ] Keep Phase 03.3 proposed physical DB and migrations UNAPPROVED; no database/app has been deployed.
- [ ] Keep native Penpot, Phase 02 142 QA cases, brand/font, accessibility/security/performance gates OPEN.

**Review decision template (not yet issued):** `I approve DEVFOLIO OS Phase 03.4 at design-specification level only, subject to the explicitly open SRS, final database/API, QA, Penpot and security gates. Record the design decision with exact PR/commit version.`
