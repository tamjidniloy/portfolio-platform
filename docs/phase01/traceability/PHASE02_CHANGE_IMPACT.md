# Phase 01 ↔ Phase 02 Requirements Change Impact Review

**Status:** RECONCILIATION PROPOSAL — owner approval pending.  **Baseline:** Phase 01 SRS v1.0 **DRAFT**.

| ID | Phase 01 proposal/source | Phase 02 design decision/context | Impact / decision needed |
|---|---|---|---|
| CHG-01 | DEC-13 original provisional light option / theme preset | Phase 02.9 dark palette approved; light **future-ready only** | Do not include production light toggle in release 1 unless separately approved; adjust FR-034 and site field dictionary after approved SRS reconciliation. |
| CHG-02 | DEC-01 / profile.display_name, site.brand_name | Final public brand and exact typeface remain OPEN | No placeholder treated as final public identity; approve copy and accessibility/performance of selected font later. |
| CHG-03 | FR-027/045, draft/preview/publish requirements | Approved CMS publishing UX at design-spec level | Reconcile validation/publishing semantics; server-verified outcome and no draft leakage mandatory. |
| CHG-04 | FR-005/006 and research_status / status | Research scientific stage separate from CMS publication status | Confirm two distinct vocabularies and truthfulness constraints, especially peer-review/publication assertions. |
| CHG-05 | FR-025 and article writing | Phase 02 IA conditionally hides Writing when no published posts | Reconcile Release 1 publishing capability vs initial nav visibility. |
| CHG-06 | NFR-001 accessibility WCAG 2.2 AA | Phase 02.11 requirements approved at specification level | All 52 responsive/a11y cases NOT RUN; actual browser, zoom, screen-reader tests required. |
| CHG-07 | FR-018/038-043 security/auth | Owner-only login + email challenge designs | Real auth architecture/provider, rate limits, OTP paste, password manager compatibility to finalize in Phase 03. |
| CHG-08 | FR-026/047 and file limits | Phase 02 forms and media states provisional | File constraints/MIME/limits/storage configuration not approved; no inferred DB schema. |
| CHG-09 | NFR-004 Core Web Vitals | Responsive/editorial design visuals approved | Targets remain implementation measurement goals; no field performance evidence yet. |
| CHG-10 | FR-013/032/046/052 contact retention | Contact/inbox UX specified | Privacy retention, consent and delivery wording still need owner decisions. |
| CHG-11 | Content field max lengths and 16 CMS modules | Phase 02.8 registry contains historical 147 provisional fields | No final contract until approved source SRS reconciled; compare every field and validation. |
| CHG-12 | Responsive / admin route matrix | Phase 02.13 contains 18 representative high-fidelity screen types | Do not equate representative prototype with exhaustive full application screen coverage. |

## Requirements version-control rule
Before Phase 03 architecture data model and API contracts are frozen, compare the *actual owner-approved SRS* against this historical draft, the Phase 02 ADRs, form registry and latest GitHub tree. File discrepancies as individual changes with IDs, owner decision, and revised acceptance cases. A description of an earlier conversation approval cannot substitute for the approved source version.