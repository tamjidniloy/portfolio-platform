# 03.5.2 Authentication, Authenticator Choice and Secure Recovery

## Critical divergence: historical requirement vs assurance standard
`FR-039` password-first, `FR-040` one-use **email challenge**, `FR-042` recovery are in the historical SRS and the unapproved v1.1 candidate. The Phase 03.4 candidate `/api/v1/auth/password`, `/email/verify`, `/email/resend` routes represent that **legacy proposal**. **NIST SP 800-63B-4 §3.1.3.1 explicitly says email SHALL NOT be used for out-of-band authentication.** This is a standards inconsistency if the owner expects phishing resistance or NIST AAL2, not a hidden approval to replace email.

## Owner decision table
| Option | Proposed login | Primary risk / tradeoff | Security decision |
|---|---|---|---|
| A — Legacy SRS | Password + short one-use emailed code | Email compromise, phishing and message interception; **cannot claim NIST AAL2** solely from this flow | NOT APPROVED; document accepted risk if chosen |
| B — Candidate stronger | Password + authenticator-app TOTP | OTP can be phished; enrollment/recovery and clock skew require protection | RECOMMENDED fallback option; needs SRS change and tests |
| C — Strongest direction | Passkey/WebAuthn with verified user presence and appropriate user verification | Device and recovery UX, device portability and compatibility | PREFERRED for phishing resistance, subject to capability/provider review |

**Proposed decision for explicit approval:** allow WebAuthn/passkey if feasible, and consider a securely enrolled TOTP-based fallback; email only for address confirmation/recovery notification (subject to threat model). Do **not** implement or claim the replacement without an owner-approved change to FR-040 and OpenAPI contracts. Exact assurance level is unassigned.

## Legacy flow (candidate only)
1. Client submits owner identifier/password over HTTPS with Origin/Fetch Metadata checks and abuse throttling; responds generically for unknown owner/wrong password.
2. Password verifies with **Argon2id** using per-password salt and a benchmarked work factor. Only a limited pending challenge (not owner session) is issued.
3. Generate cryptographically secure short-lived code; store **keyed verifier** rather than raw code; bind to pending challenge, expiry, retry budget, and purpose; avoid logging. Delivery failure never authenticates.
4. Validate one-use code with atomic consumed update, expiration/attempt counters and replay prevention. On success, invalidate pending challenge and create fresh server-backed session; reject replay/invalid/expired.
5. Resend invalidates or rotates prior code and is bounded by total attempts/time/cooldown; no email-enumeration in user-visible messages.

## Preferred authenticator alternative
Passkey/WebAuthn uses challenge bound to relying-party origin, verified RP ID and credential, algorithm and counter handling; verify user presence/verification requirements according to owner policy. TOTP, if chosen, should use trusted verifier and tightly bounded replay window, **store secret encrypted at rest**, protect enrollment, and prevent reused time-step replay. Both require reviewed recovery.

## Provisioning, password policy and recovery
Provision a single owner via operator-only bootstrap channel, never open registration. Require long memorized secret, block common/breached passwords and allow password managers/paste; avoid forced arbitrary periodic rotation. Argon2id parameter minimum from OWASP is **19 MiB memory, t=2, p=1**, then benchmark/tune for actual hosting. Rate-limit verification independently of password hash cost.

Recovery start returns generic response; deliver time-bounded, one-use recovery artifact; protect replay, account-enumeration and token leaks from URL/referrers. Recovery must not silently bypass selected MFA assurance; require recovery policy or manual operator proof before sensitive reset where feasible. On completion rotate secret, revoke all sessions/challenges, notify owner through an independent channel, log redacted event. Never present email recovery as NIST-compliant MFA.

## Draft numerical safeguards — owner/implementation calibration required
| Parameter | Initial engineering candidate | Evidence gate |
|---|---|---|
| Password minimum | 15 chars for single-factor-only; policy for MFA follows current NIST guidance | SRS and password rules approval |
| Challenge lifetime | 5 minutes | Race/replay test |
| Challenge attempts | max 5 per pending challenge | Negative tests |
| Challenge resend | 60-second cooldown; bounded total sends | Abuse test |
| Session idle / absolute | 30 minutes / 12 hours for admin (candidate, stricter for high-risk) | Threat/budget usability review |
| Auth retry buckets | IP + hashed owner ID + coarse device context, with backoff | Load/false-positive tests |

These are **illustrative settings, not deployed defaults or locked contract values**. OWASP and NIST may specify additional constraints depending on selected authenticator and assurance level.
