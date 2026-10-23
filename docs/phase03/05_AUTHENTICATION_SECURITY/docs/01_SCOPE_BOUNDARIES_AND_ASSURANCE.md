# 03.5.1 Security Architecture, Assumptions, and Trust Boundaries

## System trust map
**Public** browser/crawler → TLS edge → React Router SSR / Express route handlers → published-only query facade → public DTO allowlist → rendered HTML/JSON. **Owner** browser → same origin → request middleware (session, CSRF, policy, audit) → authorized application commands → PostgreSQL transactions + durable outbox → integrations.

**Boundaries:** B1 untrusted browser/edge; B2 authentication and session; B3 owner object-level authorization; B4 draft/private-to-published projection; B5 database service grants; B6 staging/private-to-public media; B7 external email; B8 operational privileged access/logging; B9 backups and restores. Trust is checked *on each crossing* and cannot be inferred from hiding buttons.

## Principal classes
`anonymous`: public published-only reads and bounded contact/auth initiation. `pending_challenge`: not logged in; may only finish/challenge-resend own pending transaction subject to rate limits. `owner_active`: server-validated session and per-resource policy; mutating requests pass CSRF, origin and revision rules. `operator/migration`: out-of-band privileged automation with separate credentials, never a visitor session. `outbox_worker`: narrowly scoped integration privileges, no admin HTTP login.

There is **one owner**. Role hierarchies, public accounts and third-party SSO are out-of-scope unless the SRS changes. Authorization remains future-proof through action/resource policies, not public RBAC claims.

## Threat scenarios and priorities
Account takeover; brute force and credential stuffing; email account takeover/code replay; CSRF; stored/reflected XSS; session fixation/theft; draft/preview leaks via SSR, JSON or cache; BOLA on object IDs; unsafe uploads and public staging URLs; publication concurrency/rollback; PII leakage and contact spam; credentials in CI and logs; supply-chain compromise; backup and incident recovery.

**Target:** secure-by-design candidate controls, with OWASP ASVS 5.0.0 L2-inspired review scope where appropriate; **not a claim of ASVS level attained**. 2025 NIST 800-63B-4 limitations for email verification are documented as a blocker for any AAL2 claim.

## Explicit exclusions
No implemented identity provider, MFA enrollment or production key store; no working server or scan results; no final rate-limit values; no data breach response SLA or regional legal advice. These are design decisions subject to owner review and implementation testing.
