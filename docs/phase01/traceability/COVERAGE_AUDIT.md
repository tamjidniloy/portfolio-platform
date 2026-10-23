# Phase 01 — Requirements Coverage Audit (Draft Baseline)

Source: `REQUIREMENTS_CATALOG.md`, `ACCEPTANCE_TESTS.md`, both **draft**. Original files kept intact. **No tests executed**.

- Functional requirements (FR): **52**
- Nonfunctional requirements (NFR): **24**
- Total candidate requirements: **76**
- Original acceptance test IDs: **43**
- Requirements explicitly referenced in original acceptance-test mapping: **58**
- Requirements with no explicit original acceptance-test mapping: **18**
- Proposed additional candidate test cases: **18**, all **NOT_RUN** and require owner/test-lead approval.

The CSV maps *literal IDs* and abbreviated multi-ID spans present in the original draft test table. It is a structured documentation crosswalk, **not** proof that any test passes or that all goals have an executable automation.

## Important quality findings
1. No approved SRS version/owner signature has been verified: the original file itself is marked draft.
2. At least 18 catalog IDs lack direct literal AT associations in the original test table. Some may be indirectly exercised; the proposed tests should be reviewed, not blindly accepted.
3. Design decisions in Phase 02 affect optional light mode, navigation visibility and field interpretation; reconcile before data model/API lock.
4. Sensitive acceptance checks (privacy, admin access, draft leakage, backup restore) require real system verification. No such implementation tests are part of Phase 01 documents.
5. Page inventory/content-field caps are historical requirements proposals, not committed database schemas.