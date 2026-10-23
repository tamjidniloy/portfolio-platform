# 03.6.6 — Telemetry, SLI/SLO and alert design

## Proposed signals
- **Golden signals:** user-visible request success/errors by public vs admin, latency p50/p95/p99 at controlled endpoints, traffic, saturation/cpu/memory, DB connections/lock waits, outbox retry/dead-letter growth.
- **Truthfulness/security signals:** anonymous draft leak probes, unauthorized resource probes, invalidated public slug probes, email OTP resend/lockout abuse (aggregate only), publish failures and latency of cache invalidation.
- **Dependency health:** DB availability/backups/WAL archival delay, mail API availability, object store staging/finalize, TLS cert expiration, DNS checks, worker lag, storage capacity and quota/budget.
- **Web vitals:** LCP <=2.5 s, INP <=200 ms, CLS <=0.1 as *targets* in historical NFR-004 at 75th percentile; requires real field data. Lighthouse lab runs are not sufficient.
- **Structured logs**: trace/request ID, route pattern (not secret token/slug containing PII), action type, synthetic user/session pseudonym if essential, elapsed ms, controlled error category, deployment SHA. No raw credentials, message bodies, email challenge codes, full drafts, access tokens or storage signed URLs.
- **Tracing**: internal span boundaries for SSR route → published query, auth/session, DB, outbox and dependency calls. Sample sensitive endpoints with privacy limits; avoid request/response body capture.

## Candidate SLOs (owner review)
- Public serving success: 99.9% *aspirational* monthly **P1**, not a provider-backed promise; define only on production user journeys and exclude planned maintenance explicitly if approved. Illustrative 30-day error budget = 43.2 minutes.
- Public p95 response time and owner action duration: thresholds TBD from staging and measured traffic; do not invent commitments.
- Publish-to-public consistency: target <60 seconds candidate for normal operation; privacy-critical **unpublish should fail closed immediately** through authoritative reader; verify CDN behavior, not just queue completion.
- Backup recoverability: target 100% scheduled backup completion and periodic restore evidence; proposed 4h RTO / 24h RPO pending owner approval.
- No tolerated public exposure of draft/PII: privacy/security incident regardless of aggregate SLO percentages.

## Alert severity and actions
| P0 | Confirmed data leak, compromised admin identity, unpublish leak, destructive DB issue, missing recovery keys. Immediate incident; revoke/contain, preserve evidence, notify owner. |
| P1 | Sustained public availability fault, backup chain missing, major outbox backlog, certificate near expiry, DB storage or connection exhaustion. Page active operator, triage. |
| P2 | Noncritical stale SEO content, low-rate provider degradation, rising costs, new dependency vulnerabilities. Issue/ticket with deadline. |

Each alert must have: owner, expression/threshold, quiet periods, dedup policy, triage runbook, sample no-PII payload and test evidence. Avoid paging on single transient responses; **security events override statistical suppression**. See `matrices/ALERT_CATALOG.csv` and `runbooks/`.
