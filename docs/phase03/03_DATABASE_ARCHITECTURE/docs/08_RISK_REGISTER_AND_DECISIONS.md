# 03.3.8 — Open Decisions and Risks

| ID | Severity | Risk | Mitigation and gate |
|---|---|---|---|
| R33-01 | P0 | SRS v1.1 candidate not approved | Review exact owner decision before final schema/API lock |
| R33-02 | P0 | Public draft leak via JSONB payload | Public projection table and negative anonymous loader/sitemap tests |
| R33-03 | P0 | Stale public cache after unpublish | DB authoritative, no shared cache initially, verify purge before enable |
| R33-04 | P0 | Media signed URL persists after unpublish | Private storage, short leases/gated public proxy, revoke tests |
| R33-05 | P0 | Password/OTP/session compromised | Hashed verifiers, TTL, attempt limits, revocation, event redaction |
| R33-06 | P0 | Contact PII retention undefined | Owner privacy policy, purge and backup scope decisions |
| R33-07 | P1 | JSONB schema drift / invalid content | Versioned payload schema validators, contract tests, migrations |
| R33-08 | P1 | Outbox replay duplicate email/invalidation | Stable idempotency key and consumer acknowledgements |
| R33-09 | P1 | Concurrent publish/rename slug race | Revision precondition, row lock, unique public_path |
| R33-10 | P1 | ORM auto-serialization leaks private fields | Explicit public DTO allowlist; no domain entity serialization |
| R33-11 | P1 | DB migrations outage/data loss | Expand-contract, backups/restore evidence, staging rehearsal |
| R33-12 | P1 | Provider/cost assumptions unsourced | Hosting, email, object storage, backup ADRs before deployment |

The `matrices/DECISION_REGISTER.csv` contains 12 candidate/rejected/unresolved ADR choices. No provider or database version has been approved. Owner approval of Phase 03.2 design does not transfer approval to Phase 03.3 table definitions.
