# DEVFOLIO OS — Phase 03.4 API Architecture & Interface Contract Design

**State: DESIGN PACKAGE PREPARED — OWNER REVIEW PENDING. NOT IMPLEMENTED, APPROVED AS FINAL, DEPLOYED OR RUNTIME TESTED.**

Source of truth today: Phase 01 `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md` remains **unapproved**. Phase 03.2 was explicitly owner-approved **at design-specification level only**. Phase 03.3 is a proposed ERD/SQL handoff; not a deployed or approved physical schema.

## Start with these files
1. `docs/01_API_ARCHITECTURE_AND_BOUNDARIES.md` — routing model, ports and decisions.
2. `docs/02_ROUTE_AND_OPERATION_CONTRACTS.md` — SSR and resource routes, DTO contracts, pagination.
3. `api/openapi-3.1.2-candidate.yaml` — 29 machine-readable **candidate** HTTP operations, with request/response/errors, security and revisions.
4. `matrices/SSR_AND_UI_ROUTE_INVENTORY.csv` — 41 SSR/UI and non-JSON resource routes.
5. `matrices/SECURITY_POLICY_MATRIX.csv` — per-operation auth/CSRF/cache/idempotency/precondition obligations.
6. `docs/03_AUTH_SECURITY_AND_PRIVACY.md` — anti-replay, no-draft-leakage, session and CSRF boundaries.
7. `docs/04_PUBLISHING_CONSISTENCY_AND_REVISIONS.md` — publish/unpublish and background invalidation.
8. `docs/05_ERRORS_VALIDATION_AND_RESILIENCE.md` — status taxonomy and truthful UI.
9. `docs/06_MEDIA_CONTACT_SEO_AND_CACHING.md` — provider-facing flows without binding vendor choices.
10. `docs/07_TRACEABILITY_TESTING_AND_EXIT_GATES.md` — test plan, open gates and Phase 03.5 handoff.
11. `review/OWNER_REVIEW.md` — decision checklist; no boxes auto-approved.
12. `OPEN_API_ARCHITECTURE.html` — offline browsable report and diagram links.

## Baseline decisions carried forward
- Modular monolith; React Router Framework Mode SSR on a candidate Node/Express host.
- Internal `application` ports are distinct from HTTP endpoints. Not every service port becomes a public REST API.
- Published-only public facade, allowlisted public DTOs, no draft/public data joining, authoritatively denied preview for anonymous visitors.
- Protected owner reads/writes; owner identity comes from validated server-side session, never from request JSON.
- Strong revision precondition for stale owner writes; atomic published snapshot/outbox/audit; no false publication/success acknowledgments.
- Distinct research scientific stage and CMS publication status.
- Contact-message storage acknowledgment != email delivery; media staging privately before public eligibility.
- No Release 1 light theme switch; exact public brand and font remain open.

## Counts and status
- 41 SSR/UI route candidates; 29 API operations over 26 paths.
- 31 reusable proposed schema objects; 12 standalone validation schema files; 8 illustrative payload examples.
- 60 non-executed review checks (API34-001..060); proposed test matrix, not actual test results.
- Security-policy and requirements traceability matrices auto-generated and checked against the API operation inventory.
- No running service, dependency installation, genuine network calls or authorization tests were performed.

## Unresolved gates
**P0:** Owner-approved authoritative SRS, requirements-dependent field limits and security policies, final API/schema contracts, authentication/cookie/CSRF options, privacy/retention and content types. **Open external:** Native Penpot evidence; 142 earlier design QA cases; browser/WCAG and security execution; public brand/font.

## Standards/reference points
- OAS 3.1.2: https://spec.openapis.org/oas/v3.1.2.html
- React Router resource routes: https://reactrouter.com/how-to/resource-routes
- OWASP API Security Top 10 2023: https://api-security.owasp.org/editions/2023/en/0x11-t10/
- RFC 9457: https://www.rfc-editor.org/rfc/rfc9457.html

The API examples use placeholders. They do not represent real portfolio work, real users, real auth tokens or tested production endpoints.
