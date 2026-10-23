# 03.7.5 — Auth, Security and Privacy Integrated Review

## Owner access policy
A single administratively provisioned owner may authenticate. No visitor registration or public account. Authentication challenge handling must reject expired/replayed attempts and be rate limited, with safe generic error responses. Use Argon2id for passwords under the earlier requirement proposal, revocable server-side session, HttpOnly Secure SameSite cookies and CSRF protection for cookie-based mutations.

## MFA conflict requiring explicit owner decision
The historical Phase01 SRS demands password + one-time email challenge. Email-based out-of-band challenge **must not be labeled NIST AAL2 compliant**, since NIST SP 800-63B-4 does not count email as an acceptable out-of-band authenticator. Alternatives under owner review: passkeys/WebAuthn (preferred phishing resistance), TOTP, or retaining email as an explicit limited-assurance interim method with risk acceptance and compensating controls. No unapproved substitution was made in this handoff.

## Security risks and treatment
- **IDOR/BOLA:** re-check object authority in application service, not only UI or route.
- **Session/CSRF:** stateful server revocation, cookie flags, origin verification, CSRF tokens, no secrets in SSR.
- **Injection and XSS:** server-side input/schema checks, parameterized DB queries, rich text sanitization and CSP review.
- **Media:** verified content type signatures, size and digest; private staging, published-only serving, reference-aware deletion.
- **Contact PII:** minimal fields, retention/deletion consent, no PII in outbox/audit/telemetry, authenticated inbox and search.
- **Supply chain:** pinned dependencies under policy, SBOM/provenance candidates, least-privilege CI OIDC with repo capability check.
- **Infrastructure:** tenant isolation, backups encrypted and accessible for isolated restore, secrets outside source.

## Assurance status
Threat scenario and control register designs are prepared; 80 Phase03.5 planned tests remain unexecuted. The Phase02 accessibility specification targets WCAG 2.2 AA; no conformance or penetration test result is asserted. Implementation must be verified independently, with evidence and defect resolution before production release.
