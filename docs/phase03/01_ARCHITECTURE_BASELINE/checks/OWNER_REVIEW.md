# Phase 03.1 Owner/Technical Architecture Review

**Status:** ALL OWNER DECISIONS PENDING. Creating the PR and assets does NOT approve architecture.

## Decisions to review
- [ ] Accept or revise the recommendation to use **React Router Framework Mode SSR + custom Express host**, single-origin modular monolith.
- [ ] Accept or revise a **published snapshot/projection** separate from owner-editable draft revisions.
- [ ] Confirm whether external clients really need versioned REST API now; otherwise loaders/actions through server services are proposed.
- [ ] Review the proposed DB-backed revocable cookie session with password and one-use email challenge, subject to final security policy.
- [ ] Review staged private media and safe public projection, pending upload budgets/limits.
- [ ] Review no-store protected routes and publication-aware SSR HTML cache strategy.
- [ ] Examine C4 diagrams, security model and request-access matrix for overlooked trust boundaries.
- [ ] Approve/revise the **actual SRS v1.1 candidate and its complete 76-ID catalog** separately; its GitHub merge is not sign-off.
- [ ] Confirm business rules on contact consent/retention, media limits, domain/hosting region and actual real content before affected Phase 03.3/03.4 contracts are locked.

## Testing claims
No native Penpot QA, WCAG compliance, backend runtime or security test has passed on account of this architecture proposal. The prior 142 planned Phase 02 design checks remain NOT_RUN; separate application acceptance tests start after implementation.

## What constitutes 03.1 approval
An explicit owner decision identifying the reviewed PR/commit and accepted/rejected architecture choices; annotate accepted ADRs accordingly. Until then the PR should remain Draft and references remain `PROPOSED`.
