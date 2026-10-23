# 03.6.8 — Cost, capacity, provider evaluation and architecture ADRs

## Unknowns
Location/region, custom domain, outbound email volume, media size/requests, data retention, uptime sensitivity, content-edit frequency, owner hosting preference and monthly ceiling **have not been approved**. No verified provider price quote or sign-up appears in this package. Do not choose a cheap provider solely because a pricing page exists: egress, backups, support, observability, serverless cold starts, SMTP, storage and overage pricing matter.

## Comparative scorecard proposal
Rate each provider 0–5 on SSR custom Express/Node compatibility, managed PostgreSQL/private network, restore-tested PITR option, object-store ACL, staging separation, deploy artifact provenance, GitHub OIDC, region/cost, email deliverability, metrics/alerts, support quality and monthly steady-state + failover cost. Include a documented *negative case* for an option rejected on security or restore limits.

## Scaling policy
- Stage 1: low-traffic portfolio, 1 app/worker instance class + managed DB appropriate for SLA; CDN only immutable published-safe assets.
- Stage 2: add horizontal runtime capacity if p95, CPU/memory, DB pool and queue lag justify it; ensure shared DB sessions, rate limits and idempotency support multi-instance.
- Stage 3: regional replicas or higher availability only on measured demand or approved business need; do not prematurely introduce Kubernetes or complex multi-region active-active.
- Alert when monthly forecast reaches e.g. 70%/90% budget as **illustrative thresholds**; review actual spending and notification recipient.

## 12 candidate ADR decisions
ADR-36-01 hosting model; -02 runtime+worker split; -03 environment approval; -04 OIDC/provider identities; -05 artifact promotion and signing; -06 schema migration sequencing; -07 PostgreSQL backup/PITR/retention; -08 media backup/revocation; -09 monitoring vendor/data minimization; -10 SLO/RTO/RPO; -11 DNS/TLS/CDN/caching; -12 incident and break-glass operation. Each remains **PROPOSED** until an explicit owner/technical approval record.
