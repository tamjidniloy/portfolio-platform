# Owner approval checklist — blockers for remaining Phase 04 development

**Not approved by default**. Approvals must name exact source revision, date and exceptions.

1. **SRS 1.1** — review complete `docs/phase01/proposals/SRS_v1_1_CANDIDATE.md` plus 76 requirement catalog, confirm identity/content/privacy requirements, approve specific commit SHA, then promote to canonical `docs/SRS.md`.
2. **MFA / FR-040** — choose passkey/WebAuthn-first versus reviewed fallback/recovery; email challenge must not be claimed as compliant NIST out-of-band MFA.
3. **DB** — approve final 18-table candidate changes, field limits, unique keys, personal data retention and deletion, publication and revision transaction semantics; approve migration set before execution.
4. **API** — approve public SSR/API boundaries, owner-only endpoints, OpenAPI version, HTTP errors and concurrency/idempotency; test negative auth/draft visibility.
5. **Providers and legal** — approve managed Node, managed PostgreSQL, region, storage/email provider, budget, logging retention, backup/RTO/RPO and appropriate privacy notice.
6. **Launch** — run browser/a11y/security/performance checks, PostgreSQL backup-restore game day and real staging release, then explicit production go/no-go.

For all choices, we can prepare proposals and tests, but a message asking to develop everything does not identify or ratify the choices. No owner passwords, recovery secrets or API tokens should ever be stored in GitHub.
