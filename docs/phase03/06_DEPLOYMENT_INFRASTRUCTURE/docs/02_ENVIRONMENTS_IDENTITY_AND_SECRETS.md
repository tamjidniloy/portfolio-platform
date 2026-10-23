# 03.6.2 — Environment isolation / service identities

Local and PR CI: synthetic test data, no production secrets, read-only repository tokens, independent ephemeral test DB, no live outbound messages. Staging: independent DB/bucket/email sandbox/identity and clearly separated URL. Production: locked storage and runtime identities, audited release operator, separate migration identity and backup vault rights. No reusable production credentials in staging or test workflows.

Principal separation: PR CI can clone/test/build only; release job can deploy candidate image via short-lived OIDC federation and scope-checked roles (provider support required); app runtime has narrow DB query/commands/media/mail rights; migration identity is short-lived DDL-only; backup principal can write isolated encrypted recovery artifacts; emergency owner identity requires time-limited break-glass actions and audit. No cloud superuser access exposed to the web admin UI.

Secrets: names/paths documented, actual values only in provider secret management; rotate with overlap and post-revoke verification, never log/copy tokens to source, image layers, GitHub issue or HTML bundle. Backups require encryption key recovery under separate custody. Protect CI workflow files as high-trust code, scope token permissions and pin audited third-party Actions to full immutable SHAs **at implementation**.

GitHub private repository caution: availability of `environment` reviewers and protections depends on plan; check eligibility before designing release approval around those rules. If unavailable, enforce a separate authenticated/manual production approval in deploy platform and audit it. Never claim platform gating is enabled without a real configuration check.
