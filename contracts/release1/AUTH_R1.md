# AUTH-R1 — Owner Identity, WebAuthn and Authorization

**Status:** OWNER APPROVED engineering baseline, 2026-10-24 (Asia/Dhaka). **Implementation:** pending. Normative companion to SRS-R1, DB-R1 and API-R1.

## Primary authentication
- Single provisioned owner, zero public registration, no emailed login OTP or email-only privileged recovery.
- WebAuthn registered passkeys with mandatory user verification (UV); require user presence, cryptographic signature, credential ownership, matching challenge, exact allowed origin and RP ID.
- Server challenge ≥32 cryptographically random bytes, 5-minute lifetime, atomic single-use consumption; bind ceremony identifier to challenge and operation. No challenge reuse or privilege grant from an expired/invalid attempt.
- Recommended at least two distinct registered passkeys for resilience; production deployment hostname/RP ID are environment-configured. Browser UX uses maintained audited WebAuthn libraries, no custom signature primitives.
- Record credential public key, credential ID, sign count, transports, backup eligibility/state, last use and revocation. Treat suspicious counter rollback as security incident with safe follow-up; synced passkeys may not have strictly increasing counters.
- Bootstrap the *first* owner credential through a separately authenticated administrator ceremony, not a self-service endpoint.

## Session and authorization
- Generate 256-bit opaque secrets; only digest kept in `admin_sessions`, never logged. Production cookie: `__Host-devfolio_session`, `Secure; HttpOnly; SameSite=Strict; Path=/`, no Domain. Local development uses an appropriately named non-`__Host-` cookie if HTTP loopback is unavoidable.
- Session absolute lifetime **60 minutes**, inactivity **15 minutes**; server-enforced on each protected request using fresh DB status and timestamp. Sensitive actions require passkey re-verification within **10 minutes**.
- Revoke on logout; rotate after privileged authentication and recovery; revoke all affected sessions on security compromise/recovery. Refuse disabled owners. Owner actions check object-level authorization, not user-controlled ID fields.
- Cookie-authenticated mutations require same-origin validation and session-bound CSRF token. Reject missing/incorrect/malformed origin and CSRF before any mutation. HTTPS required in production.

## Abuse and recovery
- Initial rate limits: 10 login challenge starts/IP/15min; 5 verify failures per owner/IP/15min; 3 recovery starts/owner/24h. Multi-instance shared durable enforcement, anti-enumeration responses, structured redacted audit.
- Recovery: backup passkey first. Offline recovery batch of **10 independent codes** with ≥128 bits entropy each, unique digest at rest, one-use atomic consumption and clear rotation/revocation. Code verification creates a **restricted recovery context**, not normal CMS authorization; require separately verified ownership or controlled trusted bootstrap to register a new credential.
- Recovery revokes compromised credentials/sessions, logs redacted audit and emits notification if configured. No email-only password reset.
- No password fallback in Release 1. Any password/TOTP fallback is a future owner-reviewed change requiring Argon2id, throttling and updated schema/API.
- Passkey registration, recovery code rotation, credential deletion and security settings require recent owner passkey re-authentication.

## Validation gates
Successful and negative browser E2E: Windows Hello and second authenticator, replayed/expired challenge, wrong origin/RP ID, invalid signature, missing UV, revoked credential, session idle/absolute expiry, rotation, logout, CSRF, concurrency, recovery privilege restriction and rate limits. No claim of security assurance level from incomplete tests.
