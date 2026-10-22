# Phase 01 ↔ Phase 02 Change Control — Draft Crosswalk

**Status:** REQUIRES ACTUAL APPROVED SRS BEFORE BASELINING. Do not mistake design-spec approval for requirements-source approval.

| ID | Draft requirement / open issue | Phase 02 decision and resulting review action |
|---|---|---|
| CHG-01 | `DEC-13`, candidate light theme | Phase 02 dark tokens approved; light candidate **future-ready only**, no Release 1 toggle. Reconcile `FR-034` and appearance fields. |
| CHG-02 | Profile and `brand_name` fields | Final public brand/name and exact font **OPEN**; placeholders not valid final identity. |
| CHG-03 | `FR-027/045` draft/preview/publish | Preserve server-confirmed status, protected preview and SSR/API/sitemap visibility rules. |
| CHG-04 | Research stage vs CMS publication | Keep scientific research status separate from draft/published/archived state. |
| CHG-05 | Writing `FR-011/025` | CMS capability is separate from displaying a Writing navigation link before public articles exist. |
| CHG-06 | `NFR-001` WCAG 2.2 AA target | Phase 02.11 spec approved only; accessibility tests have **not** passed. |
| CHG-07 | `FR-038..043` secure owner login | Actual auth, email challenge and session details must be finalized in architecture. |
| CHG-08 | `FR-026/047` media type/size | Proposed UI validation is not final accepted server limits. |
| CHG-09 | `NFR-004` Core Web Vitals | Browser field data and performance tests required after implementation. |
| CHG-10 | Contact inbox `FR-013/032/046/052` | Privacy, retention and reliable delivery messaging require explicit policies. |
| CHG-11 | Form field limits | Phase 02.8's 147 provisional fields are not final schema/API agreements. |
| CHG-12 | High-fidelity design | Representative 18-screen hi-fi pack is not full native Penpot coverage or complete functional app. |

**Reconciliation gate:** Obtain authoritative approved SRS content and explicit version/date/owner sign-off; identify differences, revise linked test cases and submit approved changes before locking Phase 03 schemas and API contracts.
