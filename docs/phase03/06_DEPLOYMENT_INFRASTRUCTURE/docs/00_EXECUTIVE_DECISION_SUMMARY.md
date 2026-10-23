# 03.6.0 — Executive technical recommendation

**Proposed default:** a low-complexity **managed Node hosting** service supporting React Router Framework SSR with a custom Express host, a separately runnable worker process for outbox delivery, managed PostgreSQL, private object storage for staged media, a managed mail provider and redacted telemetry/alerts. One logical modular-monolith application can run HTTP and worker deployments from the same immutable build. Use separate staging and production stores and identities. Avoid Kubernetes/multi-region active-active for a low-traffic single-owner portfolio unless new requirements justify operational complexity.

**Not selected:** vendor, region, SKU, managed database vendor, email provider, storage bucket, cloud identity setup, telemetry vendor and DNS. Evaluate pricing/availability and account features at decision time, without guessing. Single-instance availability may not reach 99.9 aspirational uptime target.

**Reliability hypotheses:** 99.9% monthly uptime P1 aspirational, illustrative 43.2-minute monthly error budget for a 30-day window, RTO 4 hours and RPO 24 hours as review candidates only. PITR can improve backup recovery only if physical base+WAL chain is configured and restore-tested. No SLO met or restore test executed.

**Launch runway:** SRS owner-approved baseline + MFA/privacy/budget choices → provider ADRs and proof of compatibility → Phase 04 CI/deploy/runtime implementation → staging restore/security/accessibility/performance checks → controlled production approval and audit. Phase 03.7 should integrate current architecture proposal and unresolved decisions.
