# Phase 03.1 — Threat Model Starter and Required Tests

**Status:** DESIGN ANALYSIS; no penetration test, OWASP pass or app security implementation has occurred. Use OWASP ASVS 5.0.0 stable as a verification reference, not as evidence of compliance.

## Trust boundaries
**TB-1** Anonymous internet → HTTPS edge; **TB-2** edge → Node SSR route; **TB-3** SSR public loaders → Published-only service; **TB-4** admin routes/actions → owner session guard and service; **TB-5** service → PostgreSQL; **TB-6** service → storage/email providers; **TB-7** logs/backups → operator controls.

| Threat | Abuse example | Candidate prevention | Test case to implement |
|---|---|---|---|
| Draft disclosure (critical) | Guess draft slug or use leaked loader data | Published projection; deny-by-default service; forbid draft URLs and public cache leak | Anonymous SSR, loaders, API, sitemap and search requests after save/unpublish |
| Privilege escalation | Direct POST to admin mutation without login | Session, owner role, CSRF on every write; service-side guard | Unauthenticated/expired/CSRF requests |
| Login brute force | Rapid password/OTP guessing | Rate limits, generic errors, challenge TTL/reuse checks and alerting | Rate cap, expired/reused/wrong OTP, session fixation |
| Session theft | Stolen or fixated session cookie | Opaque revocable server-side session, secure HttpOnly cookies, session rotation | Logout, recovery, replay tests |
| XSS in rich content | Malicious HTML displayed on public research page | Strict rich text schema, allowlist sanitation, context-aware encoding, CSP defense-in-depth | Stored/reflected HTML payload tests |
| CSRF | Cross-origin publish without consent | CSRF-aware mutations, SameSite, Origin checks, no mutation in GET loader | Cross-site form/external origin |
| Unsafe media | Upload script disguised as image/PDF | MIME sniff + size/type policy, quarantine/private staging, safe serving/disposition | Mismatch types, oversized, private URL, cleanup |
| Contact PII leak | Inbox exposed via public SSR or logs | Admin-only service; redact logs; privacy retention/deletion | Anonymous inbox attempts and log samples |
| Slug open redirect | Redirect target controlled by untrusted input | Allowlisted internal targets; safe current published slug | External redirect and draft redirect attempts |
| Race/rollback | Two edits publish overwrites latest version | Version preconditions + DB transaction; separate published snapshot | Concurrent draft, publish/restore conflict |
| Backup exposure | Dump or S3 object accessible publicly | Least privilege, encryption, isolated backup + restore, key rotation | Access review and isolated restore drill |
| Dependency compromise | Insecure npm package or leaked secret | Lockfile, audit, least-privilege CI, no credentials in repo | CI secrets scan, dependency analysis |

## Security acceptance principles
- Run all negative authorization tests at direct HTTP endpoints, not just UI navigation.
- Private SSR page, its nested loader data and hydration payload need the same no-leak rules.
- CSRF, upload checks, data retention and OTP numerical limits are design obligations until signed off; do not invent a permanent timeout or file size as a requirement.
- Do not store raw OTP, password reset tokens or passwords in application logs; password storage should use a reviewed modern hashing construction.
- Test clickjacking/browser headers and secure cookies on deployed HTTPS staging; security headers alone don't replace app authorization.

## Owner decisions required
Public email policy, contact privacy/consent text, message retention period, media size/types, recovery method, OTP provider/cost/rate limits, log retention, data protection region and security-incident notification policy.
