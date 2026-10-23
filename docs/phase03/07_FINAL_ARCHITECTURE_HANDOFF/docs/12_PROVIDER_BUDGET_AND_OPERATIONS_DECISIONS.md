# 03.7.12 — Owner Decision Worksheet: Providers / Budgets / Operations

**All cells below need owner review; these are NOT chosen contracts.**

| Dimension | Choices to evaluate | Decision criteria / required evidence |
|---|---|---|
| Application runtime | Managed Node PaaS / managed container / VPS | React Router custom Express host support; worker topology; logging; costs |
| Database | Managed PostgreSQL / independently operated | Region, isolation, extension needs, PITR/restore, migrations |
| Media | S3-compatible or managed object store + delivery policy | Private staging, signed access, signed URL revocation, CDN, cost |
| Email | Trusted transactional provider / SMTP with audit | Domain verification, OTP deliverability, incident recovery, budget |
| Authentication | WebAuthn/passkey, TOTP, temporary limited email challenge | Threat model, recovery, regulatory posture, library interoperability |
| Backup | Provider PITR + object versioning / encrypted physical+logical | Real restore time, media consistency, access and retention |
| CI deploy | OIDC short lived identities / tightly governed exception | Actual provider support, plan limitations, audit logging |
| Observability | Structured logs + metrics + tracing provider | PII sanitization, cost/retention, actionable alerts, incident owner |
| Public identity | Confirm real brand/name, domain, font | Owner authentic claims, rights/licensing, SEO |

Do not invent user purchasing approval, signed SLAs or compliance attestation. Scores may be added to Phase03.6 scorecards with source links and dated verification when owner decides.
