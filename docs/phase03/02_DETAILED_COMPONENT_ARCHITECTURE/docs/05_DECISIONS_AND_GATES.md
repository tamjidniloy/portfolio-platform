# Phase 03.2 — Decision and Gate Register

**Candidate, unapproved architecture design.** Phase 01 SRS v1.1 remains a candidate despite PR #22 merge.

| Decision | Proposed default | Deferred evidence |
|---|---|---|
| COMP-01 | Single-origin modular monolith | owner approval and hosting constraints |
| COMP-02 | React Router Framework SSR + custom Express | working adapter/version compatibility |
| COMP-03 | Published-only read facade + safe DTO | anonymous negative leak tests |
| COMP-04 | Central trusted owner policy | auth/CSRF security review |
| COMP-05 | Versioned draft + published snapshot/outbox | 03.3 schema ADR |
| COMP-06 | Repositories + UnitOfWork ports | implementation testability |
| COMP-07 | Disable sensitive shared cache until safe invalidation proven | deploy/failure tests |
| COMP-08 | Private staged media lifecycle | storage/limits/budget |
| COMP-09 | Contact message stored separately from mail delivery | privacy/retention |
| COMP-10 | Transactional outbox; worker retries | operational/cost ADR |

Blocking *final* schema/API approval: authoritative SRS owner signoff; privacy/retention and media limits where material; publish-state ADR and test plan. Native Penpot and 142 original Phase 02 QA cases remain outstanding separately. Exact brand/font remain OPEN; light mode future-ready only.

Next: **Phase 03.3 conceptual data model / ERD**, then physical schema after SRS signoff; **Phase 03.4 API contracts** likewise conditional. Architecture PR must remain Draft until explicit owner review.
