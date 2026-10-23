# Reference and evidence ledger — verified sources (2026-10-23)

The URLs below are public documentation for **design guidance**, not evidence any DEVFOLIO infrastructure has been configured.

- GitHub environments, plan-specific private repo caveats: https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments ; https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
- Deployment environment approvals / concurrency: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/control-deployments
- Build provenance attestations/SBOM: https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations
- OWASP CI/CD Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/CI_CD_Security_Cheat_Sheet.html
- PostgreSQL current backup chapter: https://www.postgresql.org/docs/current/backup.html
- PostgreSQL WAL/PITR: https://www.postgresql.org/docs/current/continuous-archiving.html
- Existing project source of truth: Phase 03.5 docs, Phase 03.4 API candidate, Phase 03.3 DDL candidate, Phase 03.2 design-only approval, Phase 01 SRS v1.1 *candidate*, and approved Phase 02 scoped ADRs in this repository.

This plan avoids hardcoding unverified current package versions, action SHAs, cloud prices, provider quotas or guaranteed RPO/RTO. Verify all selections at implementation time.
