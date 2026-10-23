# 03.7.6 — Infrastructure, Reliability, Release Operations

## Environments and providers
Design separate development, staging and production identities. Candidate topology: HTTPS edge, SSR Node app, isolated worker, managed PostgreSQL, object store and managed transactional email. Evaluate hosting region, pricing, service limits, backup availability and provider contract before approval. Domain or actual cloud services are **not** provisioned by Phase03.

## CI/CD architecture
Use a reproducible build and immutable artifact promoted from staging. Candidate stages: secret scanning → lint/test/static checks → SBOM/security scan → build/artifact → staging with smoke/integration tests → explicit owner/release approval → production → telemetry/rollback. CI production credentials should not be available to untrusted PR builds. Prefer short-lived identity federation where supported. Templates must remain **non-operational** until deliberately configured and tested, with actual GitHub plan approval capabilities verified.

## Backups, RTO and RPO
Design PITR-capable Postgres backup strategy and protected object storage/metadata consistency; perform isolated restore with timed measurements. The historical 03.6 **4-hour RTO and 24-hour RPO** are unapproved example objectives, not measured results. No uptime claim or DR guarantee without provider contract and evidence.

## Observability and incident response
Redacted logs, metrics and tracing for SSR 5xx, latency, login abuse, contact/email queues, outbox lag, stale cache, DB health, disk/backup status and spend. Define alert noise budget and escalation owner. Seven operations runbooks from Phase03.6 cover release/rollback, database failures, auth/secret compromise, email degradation, media leak, restore drill and TLS/edge outage.

## Operational go/no-go
Require real deployment drills, secret audits, authenticated application smoke tests, no draft leak, security/a11y checks, restore evidence, and explicit owner go/no-go. Documentation alone cannot satisfy the production gate.
