# DEVFOLIO OS — Phase 03.3 Database Architecture & ERD Design

**Status: COMPLETE DESIGN-SPECIFICATION HANDOFF / CANDIDATE ONLY.** Not owner approved as final physical schema, not migrated, deployed, executed or QA-passed.  
**Prepared:** 2026-10-23 (Asia/Dhaka). **Project:** `tamjidniloy/portfolio-platform`.  
**Parent Phase 03.2:** design-spec level approved by owner on 2026-10-23; approval record is under `docs/phase03/02_DETAILED_COMPONENT_ARCHITECTURE/review/ADR-ARCH-032-DESIGN_SPEC_APPROVAL.md`.  
**SRS:** v1.1 candidate remains unapproved; this proposal is deliberately nonbinding.

## Best starting points
1. `OPEN_DATABASE_ARCHITECTURE.html` — offline technical overview and diagram gallery.
2. `docs/01_SCOPE_MODEL_AND_ASSUMPTIONS.md` — conceptual model and why this candidate structure was chosen.
3. `diagrams/01_CONCEPTUAL_ERD.svg` and `diagrams/02_LOGICAL_ERD.svg` — editable SVG; adjacent DOT source and PNG previews.
4. `matrices/DATA_DICTIONARY.csv` — 116 candidate field descriptions across 18 entities. All provisional.
5. `schema/01_CANDIDATE_POSTGRES_DDL.sql` — **REVIEW ONLY, DO NOT APPLY TO PRODUCTION**.
6. `docs/03_PUBLISHING_CONSISTENCY_AND_TRANSACTIONS.md` and `schema/03_TRANSACTION_EXAMPLES.sql` — visibility/concurrency/outbox policies.
7. `review/OWNER_REVIEW.md` and `matrices/DECISION_REGISTER.csv` — owner decisions and explicit blockers.

## Deliverable inventory
- 18 proposed physical tables, 116 fields, 17 conceptual/logical relationships.
- Three diagrams rendered from editable Graphviz DOT + original SVG and PNG.
- DDL proposal, safe public query examples, transaction examples, and verification queries.
- Complete data dictionary, entity/relation inventory, FR/NFR crosswalk, 12 pending decisions, 40 new review checks (all **NOT_RUN**).
- Security/privacy, migration/rollback/backup, indexes/performance, test planning and Phase 03.4 bridge.

## Scope boundaries and quality of evidence
- This is **not** a final database contract. Schema name, constraints, enum values, entity fields, JSONB model and provider/ORM tooling require owner-approved SRS and architecture ADR before Phase 04 implementation.
- Public pages access only `published_snapshots` through an allowlisted public service. Private `content_revisions`, auth tables and `contact_messages` are not anonymous query sources.
- 0 complete test passes is **not claimed**; only static artifact checks (ZIP integrity, DOT rendering, CSV counts, consistency lint) were executed.
- No database instance was created or migration actually run.
- Phase 02's 142 design QA checks and Phase 03.2's 42 checks remain unexecuted unless separately evidenced.

## Package versus GitHub
The original ZIP is downloadable from this conversation. A draft stacked PR is prepared for text and editable diagram source; binary ZIP inclusion in GitHub must be separately verified. See `review/OWNER_REVIEW.md`.
