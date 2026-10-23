# 03.4.3 — Authentication, Authorization, CSRF & Privacy Contracts

## Owner authentication state machine (candidate)
UNAUTHENTICATED → PASSWORD_VERIFIED_PENDING_EMAIL → VERIFIED_ONE_USE_CHALLENGE → AUTHENTICATED_SESSION → REVOKED/EXPIRED. A successful password **must not** create an admin session. No self-registration. Passwords are Argon2id-hashed per historical draft NFR; secure recovery revokes old credentials/sessions as policy requires.

- Password/OTP and recovery endpoints: rate-limit per device/identifier (privacy-safe), generic failures, no account enumeration, no token echo, no secret logging. OTP is single-use, short-lived and scoped to challenge; replay rejected. Session created only after verified code, rotated to prevent fixation.
- Session cookie: Secure, HttpOnly, host-only and same-origin; SameSite attribute/TTL chosen and tested in Phase 03.5. CSRF token is never used as authentication. Check both Origin/Referer policy and CSRF for cookie-authenticated mutations. Avoid unsafe CORS.
- Admin actions: deny by default; load validated session once in server request context and verify object authorization inside each application command, not solely UI route or menu visibility.
- Permission rules: single owner does not remove need for resource ownership checks, media access control or function-level permission. Never accept an actor ID or `isAdmin` flag from submitted JSON.
- Anonymous `/api/v1/public/*` projection: strictly approved fields. `/api/v1/admin/*`: no shared cache, no CDN cache key accidental session reuse, response and log redaction.

## Threat/failure checklist
| Attack | Protection requirement | Future evidence |
|---|---|---|
| BOLA/IDOR | Object/function policies at server port; avoid trusting IDs | Forbid anonymous and alternate-object reads |
| Broken function auth | CSRF + session on admin writes | Negative GET/POST without/expired session |
| Mass assignment | Explicit DTO input allowlists | Inject actor, publishedAt, role and private flags |
| Credential stuffing/OTP replay | Rate controls, generic response, TTL+one-use | Security integration and attempt-limit tests |
| Contact spam/PII disclosure | Input bounds, CAPTCHA/anti-bot option, retention policy | Abuse and privacy inspection |
| SSRF/media attacks | Allowlisted URL origins, staging MIME/signature/size, external media ACL | Malicious URL and file-type tests |
| CSRF | Origin policy, session-bound token, SameSite in depth | Cross-origin write negative tests |
| XSS via rich text | Render sanitization, CSP decision, no unsafe HTML | Stored and reflected payload tests |
| Draft leakage | Central published projection, no-store preview, private media | Anonymous SSR/API/sitemap/CDN/raw HTML tests |
| Cache replay after unpublish | Disable shared cache pending proven generation invalidation | Immediate anonymous negative test after unpublish |

## Privacy and retention (not fixed)
Contact emails/names/messages, IP-derived anti-abuse signals, session records and audit events are personal data. Collect minimum; decide lawful basis, consent wording, deletion and retention windows before launch; no default analytics provider selected. Logs should carry random request ID and redacted safe event category, never contents or token material.

**No security review, penetration test, OWASP certification or WCAG conformance was performed.**
