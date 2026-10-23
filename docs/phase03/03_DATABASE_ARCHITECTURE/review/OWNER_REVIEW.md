# Phase 03.3 — Owner Review and Acceptance Checklist

**State:** NOT OWNER APPROVED. Phase 03.2 design-only approval is separately recorded and does not approve this schema.

- [ ] Review conceptual entity boundaries and confirm the candidate source/projection separation.
- [ ] Choose whether content typed payload revisions use JSONB, typed domain tables, or hybrid normalized extensions.
- [ ] Confirm all Release 1 content types and links, their public slug/path rules and editor states.
- [ ] Confirm site/profile singleton policy, publication versioning and revision retention.
- [ ] Approve or amend retention/consent for contact messages, audits, auth challenges and media.
- [ ] Confirm media revocation and public derivative policy before uploads/publishing are implemented.
- [ ] Decide database migration tool, PostgreSQL version, restore/RPO/RTO/hosting after budget and provider review.
- [ ] Validate 76 requirement IDs and Phase 02 field proposals against the **owner-approved** SRS (still missing).
- [ ] Review security: explicit allowlisted public snapshots, session/OTP, row-level grants and CSRF.
- [ ] Review indexes, constraints and SQL examples as **proposed only**, not tested migrations.
- [ ] Review 40 Phase 03.3 QA cases (all NOT_RUN), 42 Phase 03.2 checks and 142 Phase 02 QA cases remain unchanged.
- [ ] Approve 03.3 design specification separately; do not merge or mark this list complete merely because an SRS/architecture PR is merged.

### Completion rule
Phase 03.3 **deliverable preparation** is complete when all documents, diagrams, matrices, scripts and hash manifest exist and pass static packaging checks. **Acceptance is pending** until owner review; schema/API freeze and code migration require approved requirements and ADR evidence.
