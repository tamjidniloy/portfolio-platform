# RB-06 — Quarterly recovery exercise (candidate)
**Trigger:** planned drill or backup-integrity alert. **Status:** planned, NOT_DRILLED.
1. Pick isolated staging/test environment with separate IAM keys, no real outgoing mail/notifications or public DNS.
2. Fetch verified DB snapshot / WAL inventory plus matching media inventory and decryption access under least privilege.
3. Restore DB and assets, confirm schema/version/canonical published content + revocation + contact PII handling.
4. Execute published-only SSR, owner denied/authorized probes, broken-reference checks, and safe outbox replay controls.
5. Record measured seconds/minutes for recovery (observed RTO) and difference from chosen recovery point (observed RPO) with artifacts.
6. Update runbooks/retention/cost and have owner sign off; do not mark any test PASS without real evidence.
