# Phase 03.6 — Owner decision and design acceptance (NOT YET GIVEN)

**Status:** ALL DECISIONS OPEN. **Design package created** does not equal **design approved**, and a merged PR would not imply production readiness.

- [ ] Review candidate managed Node/Express SSR modular-monolith + PostgreSQL + worker + object storage + email deployment topology.
- [ ] Review cloud/PaaS versus managed containers versus VPS including region, monthly budget, service/cold-start/health constraints.
- [ ] Accept or change production/CI/staging isolation, runtime/migration/backup least-privilege service identities.
- [ ] Verify GitHub private-repo plan supports desired environment reviewers; choose workable external approval if not.
- [ ] Accept conditional OIDC, action SHA pinning, lockfiles, SBOM/provenance and no production secret access from PR jobs.
- [ ] Approve or change staged immutable-artifact release and rollback, migration expand/contract strategy.
- [ ] Define and approve real RTO/RPO, backups/WAL/PITR choice, media consistency and retention privacy obligations.
- [ ] Define and approve measured SLO SLIs and alert destinations, monitoring costs, PII-safe audit retention.
- [ ] Validate published-only SSR/API/CDN/media revocation and fail-closed unpublish behavior.
- [ ] Approve incident roles, break-glass steps, release authority and restore-drill cadence.
- [ ] Review 12 candidate ADRs, 30 operational controls and all 96 proposed NOT_RUN checks.
- [ ] Keep Phase 01 SRS, Phase 03.3 DB/03.4 API, Phase 03.5 MFA, Penpot, accessibility, production and live QA gates OPEN.

Approval, if explicitly given later, should state `I approve the exact Phase 03.6 design-specification proposal in PR #... at commit SHA ...; no deployment, provider selection, migrations, runtime tests or SRS approval are implied. Open choices are ...`. Do not auto-fill this record.
