# 03.3.5 — Migration, Recovery and Rollback Design

**Status: PROPOSAL. No migrations or backups have run.** ORM/SQL migration tool, hosting topology and Postgres version require ADR approval.

## Candidate baseline and tooling
- Prefer checked-in, sequential, immutable migration files with SQL review and reproducible development/CI/staging environment; migration service credentials separate from runtime credentials.
- Initial baseline includes relational custody/auth/message/outbox and published projection. JSONB content validators versioned per content type at application boundary.
- Use staging restore snapshot and dry-run migration before production; backup before stateful change; review DB write locks/timeouts.

## Expand–migrate–contract (zero-magic approach)
1. **Expand:** add optional column/table/index compatible with both old and new app; no dropping old fields on initial rollout.
2. **Backfill:** bounded idempotent batches, verify counts/checksums, rate limit for production.
3. **Dual read/write only where necessary**, with explicit consistency tests and rollback direction.
4. **Switch reads:** deploy tested app release supporting expanded schema.
5. **Contract:** remove old columns/paths only in separately approved change after rollback window.

## Recovery workflow (proposed)
- Define owner-approved RPO/RTO and provider capabilities. RPO/RTO not selected yet; `1daily backups` alone cannot prove restoration.
- Backup Postgres database and necessary storage object inventory/manifests, encryption keys availability, and deployment version/pending migration ledger.
- Restore into isolated nonproduction environment, verify FK integrity, publication snapshots, media references, migration level, count and access rules; never send real OTPs/emails from restore.
- Record restore drill timestamp, success/fail, operator, resulting recovery point and remediation. No PASS status before a real drill.

## Rollback caveats
- Reverse migration is not automatically safe after data loss or column removal; prefer application rollback to a compatible revision after `1expand`.
- For destructive schema changes require backup, migration plan and explicit owner review. Audit/safe defaults for failure.
- Local `1SQL examples` must not be executed as unreviewed prod migrations.

## Deployment gates
- Owner-approved SRS and data retention policy.
- Reviewed ADR for Postgres/ORM tool, indexes and data model.
- Repeatable integration tests for publishing and authorization.
- Staging migration/recovery smoke tests and operational restore drill.
