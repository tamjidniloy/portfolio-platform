# Phase 01 SRS Reconciliation — Verified GitHub Source Index

**Snapshot date:** 2026-10-23. All referenced paths were read from `tamjidniloy/portfolio-platform` `main` while preparing this proposal.

## Historical requirements (not approved)
- `docs/phase01/draft/docs/SRS.md` — SRS v1.0 Draft, **Last reviewed: Not approved**.
- `docs/phase01/draft/docs/REQUIREMENTS_CATALOG.md` — FR-001..052 / NFR-001..024.
- `docs/phase01/draft/docs/CONTENT_FIELDS.md` — draft requirements-level field dictionary; not SQL schema.
- `docs/phase01/draft/docs/OPEN_DECISIONS.md` — DEC-01..20, several unclosed.
- `docs/phase01/draft/docs/PAGE_INVENTORY.md` — candidate public/admin routes.
- `docs/phase01/draft/docs/ACCEPTANCE_TESTS.md` — 43 historical, not executed.
- `docs/phase01/traceability/REQUIREMENT_TEST_TRACEABILITY.csv` — 76 requirement rows, 18 missing an original direct test link.
- `docs/phase01/SRS_RECONCILIATION.md` — still open and includes older snapshot language from before source archive was restored; no owner-approved SRS established.

## Approved Phase 02 design decisions — within their *narrow* scopes
| ADR path | Verified decision | Limits |
|---|---|---|
| `docs/design/ADR-UI-001_VISUAL_FOUNDATION.md` | Hybrid editorial+engineering, dark navy/teal/blue | Public brand and exact font open |
| `docs/design/ADR-IA-001_APPROVED_NAVIGATION.md` | Work, Research, About, conditional Writing, Contact; secondary URLs, publications in Research | No approved database/API contract |
| `docs/design/ADR-WF-001_HOMEPAGE_WIREFRAME_APPROVAL.md` | Responsive home conceptual structure | Wireframe only |
| `docs/design/ADR-WF-002_PUBLIC_PAGE_WIREFRAME_APPROVAL.md` | Public page families, empty states and route concepts | Wireframe only |
| `docs/design/ADR-WF-003_ADMIN_WIREFRAME_APPROVAL.md` | Private CMS, owner auth flows and form layout | Security not implemented |
| `docs/design/ADR-UX-002_CMS_FORMS_DESIGN_APPROVAL.md` | Draft, preview, publish, contact/media and form UX | 16-module/147-field registry provisional |
| `docs/design/ADR-DS-001_DESIGN_SYSTEM_APPROVAL.md` | Dark semantic color tokens, type scale/spacing | Exact font open; light mode future-only |
| `docs/design/ADR-DS-002_COMPONENT_LIBRARY_APPROVAL.md` | 24 component families design contracts | No native Penpot implementation |
| `docs/design/ADR-A11Y-001_RESPONSIVE_SPEC_APPROVAL.md` | WCAG 2.2 AA design requirements, viewport test points | 52 checks NOT_RUN |
| `docs/design/ADR-IX-001_INTERACTION_SPEC_APPROVAL.md` | 20 interaction patterns/motion/feedback | 42 checks NOT_RUN |

## Detailed Phase 02 open gates
- `docs/design/14_REQUIREMENTS_TRACEABILITY.md` — provisional pending approved source.
- `docs/design/14_OPEN_RISKS.md` and `docs/design/14_COMPLETION_CHECKLIST.md` — 142 unrun design checks, incomplete native Penpot and full approval.
- `docs/design/13_HIFI_SCREEN_SPEC.md` — 18 representative high-fidelity screen concepts, not exhaustive native design.

**Precedence:** Approvals of design specifications cannot be backdated into Phase 01 owner acceptance or represented as real app tests.
