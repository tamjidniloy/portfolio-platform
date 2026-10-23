# 03.6.9 — Requirements traceability and verification

## Source hierarchy
Historical Phase 01 FR/NFR catalog, proposed SRS v1.1 (not approved), Phase 02 approved *design scopes*, Phase 03.2 component design-only approval, and proposed Phase 03.3–03.5 architecture input. No GitHub merge automatically approves contracts, migrations or runtime security.

| Requirement ID | Design intent | Phase 03.6 evidence (not execution) |
|---|---|---|
| FR-027, FR-045 | Publish/draft isolation and immediate withdrawal | Architecture topology, release gates, cache tests, fail-closed runbook |
| FR-038..043 | Secure owner provisioning/auth/session/recovery | Secrets/identity, account compromise response, Phase 03.5 MFA design gate |
| FR-046 | Truthful contact notifications | Provider degradation and outbox/receipt separation |
| FR-047 | Media limits and access | Object-store ACL, CDN invalidation, media integrity checks |
| FR-048..049 | Health, telemetry | Readiness/health and incident handling, no secret leakage |
| FR-050 | Backup/restore | DB/media backup chain and isolated restore drill |
| FR-051 | Sitemap | Published-only SEO and revocation after withdrawal |
| FR-052 | Contact privacy/deletion | Retention/restore re-deletion policy |
| NFR-001/002/018 | WCAG 2.2 AA/responsive/browser | Release a11y/browser checks; cannot assert conformance now |
| NFR-003/004 | Crawled SSR and Core Web Vitals | Raw HTML/field measurements, public latency probes |
| NFR-005..010 | Credential/session/CSRF/validation/uploads | Security program, controls, staging negative probes |
| NFR-011/012 | DB integrity and recoverability | Migration gates, isolated recovery plan |
| NFR-013/014 | TLS/privacy | Certificates, encryption, minimal telemetry |
| NFR-015 | 99.9% aspirational reliability P1 | Candidate SLO and budget; measure at launch |
| NFR-016/017 | Ops support and modular maintainability | Logs/alerts/runbooks and independent worker |
| NFR-019/020 | No secrets in repo; staged release | Protected CI, secret scans, staging/production separation |
| NFR-021/023 | Email resilience and testability | failure injection, 96 NOT_RUN checks |
| NFR-024 | Cost review | Provider scoring and alerts |

## Verification plan
`review/DEVOPS_QA_REGISTER.csv` contains 96 uniquely identified cases (DO36-001..096) covering deployment, security/SCM, artifact supply-chain, SSR/public-private, migrations, backup/DR, media, email, TLS, performance, alerting, cost and incident playbooks. Every case is **NOT_RUN**; adding a CSV is not performing a test. Static package validation checks file integrity/unique IDs only.

Before production, execute selected P0 and P1 checks in staging under real provider isolation with documented timestamps/assignees/artifacts; re-run security/privacy regressions on every release. Release compliance and security claims require actual evidence and review.
