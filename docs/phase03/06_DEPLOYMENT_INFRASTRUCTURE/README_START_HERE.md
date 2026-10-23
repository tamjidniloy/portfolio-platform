# DEVFOLIO OS — Phase 03.6 Deployment, Infrastructure, Reliability & DevSecOps Architecture

**Status:** COMPLETE AS A PROPOSED DESIGN HANDOFF; NOT OWNER APPROVED, DEPLOYED OR RUNTIME-TESTED.  
**Prepared:** 2026-10-23 (Asia/Dhaka). **Repo:** `tamjidniloy/portfolio-platform`.  
**Preceding milestones:** Phase 03.2 approved at design-specification level only; 03.3 DB, 03.4 API, 03.5 security are proposed designs.  
**SRS:** v1.1 candidate in `docs/phase01/proposals/` remains not expressly approved. 

This archive contains deployment topology and environment-isolation specifications, network and infrastructure controls, GitHub Actions/CI/CD supply chain design, backup and PITR options, monitored SLOs, production release/rollback rules, service inventories, provider comparisons, threat/risk registers and seven incident/recovery runbooks. It includes twelve candidate ADRs, 30 operational control obligations, **96 new QA cases all NOT_RUN**, and four editable Graphviz diagrams with SVG/PNG exports.

Read `OPEN_INFRASTRUCTURE_ARCHITECTURE.html`, then `docs/00_EXECUTIVE_DECISION_SUMMARY.md` through `docs/11_REFERENCES_AND_SCOPE.md`; inspect `matrices/`, `runbooks/`, `templates/` and `review/OWNER_REVIEW.md`. ZIP contains manifest and validation summary.

**Non-negotiables:** Anonymous website/SSR/API/CDN/media only expose published and owner-approved content. Drafts/previews/admin remain no-store/non-indexed, session-authorized with CSRF defenses for mutations. Do not imply an email notification was delivered merely because a contact message was saved; or imply a CDN purge was completed because a database transaction committed. No secrets, OTPs, message bodies, raw contact PII or draft payloads in telemetry. Production cloud account, real pipeline, hosting plan, budget, domain and recovery metrics are **not configured** by this design.

**Open gates:** owner-approved SRS, Phase 03.5 MFA choice (email code cannot establish NIST AAL2), privacy/backup retention, provider selection and region/budget, measured SLO/RTO/RPO, final DB/API and security acceptance, native Penpot, Phase 02 and security/a11y testing. Private GitHub repo deployment environment gates are plan-dependent; confirm feature availability.

**Reference:** OWASP CI/CD guidance, official GitHub Actions environment restrictions, official PostgreSQL WAL/PITR documentation are listed in `docs/11_REFERENCES_AND_SCOPE.md`. No exact package versions, action commit SHAs or cost claims have been invented.
