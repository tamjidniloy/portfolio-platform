# AWS reference deployment operations

Start with `docs/phase04/04.5_DEPLOYMENT_INFRA_OBSERVABILITY.md`. The Terraform implementation under `infra/aws` is deliberately **unapplied**, and requires a chosen provider/region and paid spending approval.

- GitHub workflow `phase045-infra-validate.yml`: offline lint/parse/schema validation, NO AWS privileges.
- GitHub workflow `phase045-release.yml`: manually dispatched from `main` in protected GitHub `staging` or `production` environment. Requires repo variables AWS_REGION, AWS_OIDC_ROLE_ARN, AWS_RELEASE_BUCKET, AWS_EC2_INSTANCE_ID and SITE_ORIGIN in that environment. Provision environment branch restrictions + required production approvers in Settings first.
- `deploy-host.sh`: invoked by SSM, downloads previously built content-addressed archive and rechecks SHA; obtains a root-owned dotenv secret from Secrets Manager. The artifact is verified, symlink switched, service restarted and local readiness verified; on failed readiness it reverts.
- `restore-drill.sh`: explicit-approval isolated RDS PITR provision tool, **not** a completed restore verification.
- `health-smoke.sh https://approved-domain`: verifies HTTPS liveness, DB readiness and lack of anonymous admin access.
- Outbox and retention timers are installed disabled. Run `systemctl list-timers` and enable only AFTER reviewing provider credentials/retention/legal policy, confirming `OUTBOX_RUN_CONFIRM`, `RETENTION_APPLY_CONFIRM`, `ALLOW_PRODUCTION_MIGRATIONS`, and a separate alert handling channel. Timer enable: `sudo systemctl enable --now devfolio-outbox.timer` and (after explicit retention approval) `sudo systemctl enable --now devfolio-retention.timer`. Record a dry-run and actual service exit codes.
- Never log or paste `/etc/devfolio/runtime.env`, Secrets Manager values, SQL database credentials or migration confirmation codes.
