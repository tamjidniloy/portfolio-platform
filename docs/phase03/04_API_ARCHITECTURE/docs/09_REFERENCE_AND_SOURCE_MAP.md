# Source Map and Standards (reviewed 2026-10-23)

## DEVFOLIO source inputs
- `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md`: proposed requirements, not owner-approved; 52 FR + 24 NFR identifiers.
- `docs/phase01/draft/docs/REQUIREMENTS_CATALOG.md` and `ACCEPTANCE_TESTS.md`: historical draft references, not implemented tests.
- `docs/design/ADR-IA-001_APPROVED_NAVIGATION.md`: public IA approved at design scope.
- `docs/design/ADR-UX-002_CMS_FORMS_DESIGN_APPROVAL.md`: publishing UX and form patterns, field limits provisional.
- `docs/design/ADR-IX-001_INTERACTION_SPEC_APPROVAL.md`: server-confirmed messages and error states; 42 UX checks not run.
- `docs/phase03/02_DETAILED_COMPONENT_ARCHITECTURE/`: 26 logical components and 18 in-process ports, owner design-spec approval recorded in `review/ADR-ARCH-032-DESIGN_SPEC_APPROVAL.md`.
- `docs/phase03/03_DATABASE_ARCHITECTURE/`: 18-table conceptual candidate, no owner final schema approval, no migration execution.

## Public standards / design references
- OpenAPI 3.1.2: https://spec.openapis.org/oas/v3.1.2.html (description of JSON resource route candidates).
- React Router Framework Mode resource routes: https://reactrouter.com/how-to/resource-routes; GET via loader and writes via action (no component export for a resource route).
- OWASP API Security Top 10 2023: https://api-security.owasp.org/editions/2023/en/0x11-t10/.
- RFC 9457 Problem Details: https://www.rfc-editor.org/rfc/rfc9457.html.

This package performs source-level static validation. No internet-facing API, SDK package, real database, smoke test or WCAG test is involved.
