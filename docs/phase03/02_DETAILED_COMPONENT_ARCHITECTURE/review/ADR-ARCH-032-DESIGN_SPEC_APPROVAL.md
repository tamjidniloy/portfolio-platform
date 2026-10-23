# ADR-ARCH-032 — Phase 03.2 Detailed Component Architecture Design-Spec Approval

**Decision date:** 2026-10-23 (Asia/Dhaka)  
**Decision maker:** DEVFOLIO OS project owner  
**Decision:** **APPROVED AT DESIGN-SPECIFICATION LEVEL ONLY**  
**Source:** Explicit owner instruction in project conversation: "I approve DEVFOLIO OS Phase 03.2 detailed component architecture at the design-specification level only. Record this approval in GitHub without claiming implementation or QA completion. Keep the SRS approval, database/API contracts, Penpot and accessibility gates open. Proceed to Phase 03.3 Database Architecture and ERD Design with complete deliverables and a draft GitHub pull request."

## Exactly what is approved

The **Phase 03.2 logical design**, including its 26 logical component families (not independently deployed services), 18 proposed in-process service contracts, 27 dependency/import rules, trust boundaries, and described flows: React Router SSR/Express application layers; public published-only projections and private owner authorization; draft, revision, preview, publish and unpublish workflows; contact-message storage vs email-delivery status; research scientific stage separated from CMS publication status; transactional outbox concept; conservative cache and media-access policies.

Approval permits **Phase 03.3 conceptual and candidate logical database architecture**, reviewable ERDs, and candidate SQL/migration design. It does **not** authorize treating every proposed port, package, persistence technology implementation, schema constraint or provider integration as final.

## Explicitly not approved, completed, tested or deployed

- Authoritative Phase 01 **SRS v1.1**: owner approval **PENDING**; historical SRS is labeled Draft.
- PostgreSQL physical schema / normalization / data types / constraints: **PROPOSED ONLY**, no deployed migrations.
- Final HTTP endpoints, API responses, session scheme and package versions: **OPEN**.
- Actual source-code modules, running backend/DB, cloud storage, email, or production environment: **NOT IMPLEMENTED**.
- Phase 03.2 planned 42 review checks: **NOT_RUN**, no PASS statuses.
- Phase 02 native Penpot board/prototype evidence and its 142 planned design QA cases: **NOT VERIFIED / NOT_RUN**.
- WCAG 2.2 AA, security, performance and browser/a11y verification: **NOT TESTED**.
- Owner public brand and exact font: **OPEN**; light theme future-ready only.

## Traceability and change control

Source spec: `docs/phase03/02_DETAILED_COMPONENT_ARCHITECTURE/`.  
Related design ADRs: `docs/design/ADR-UI-001_VISUAL_FOUNDATION.md` through `ADR-IX-001_INTERACTION_SPEC_APPROVAL.md`.  
Phase 01 SRS candidate: `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md`.

Any change to component boundaries, public/private trust decisions or publication safety beyond these limits requires recorded ADR revision and owner review. The existence/merge of a documentation PR does not constitute implementation or SRS approval.
