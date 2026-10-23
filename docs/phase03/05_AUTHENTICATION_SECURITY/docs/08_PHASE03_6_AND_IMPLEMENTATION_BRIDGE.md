# 03.5.8 Phase 03.6 and Phase 04 Security Handoff

## 03.6: cross-service / deployment architecture candidates
1. Deployment network diagram: TLS termination, app, DB private network, object storage and email providers; reverse proxy trusted headers.
2. Failure modes: auth provider/email failure, session store DB outage, private media unavailable, public cache leak, backup/restore.
3. Infra choices: hosting region, secret manager, backup cadence/retention, RPO/RTO, cost, provider threat review.
4. CI/CD: least privilege, signed artifacts where supported, dependency/secret scans, environment approval, branch protection.
5. Monitoring and privacy: safe events and retention, incident runbooks, alert owners, redacted telemetry.

## Proposed Phase 04 implementation order
1. Resolve owner-required MFA change; pin React Router/Node/Express dependencies after compatibility and security review.
2. Provision owner account, password verifier and selected authenticator with secure recovery and test harness.
3. Build session/CSRF/origin middleware, object authorization and public-only DTO/projection tests first.
4. Integrate draft/publish transaction, ETags/If-Match, invalidation safety, media and contact pipelines.
5. Harden CSP/rich editor sanitization, logout/revocation, monitoring, backup and incident tools.
6. Run and record the security test register and Phase 02 browser/a11y tests; do not claim conformance until evidence.

## Change control
A selected TOTP/WebAuthn MFA option likely requires `6FR-040`7 revision and HTTP/OpenAPI changes to legacy `/auth/email/*` candidate routes. Until formally approved, no version of security architecture silently supersedes the candidate SRS or interface design.
