# 03.5.3 Sessions, CSRF, Cookies, XSS and Browser Security

## Session lifecycle
- Issue cryptographically random session verifier **only after full chosen authentication**. Pending challenge cookie is a separate short-lived state and cannot access admin data.
- Candidate cookie: `__Host-devfolio_session=<opaque>; Path=/; Secure; HttpOnly; SameSite=Lax` (Strict if workflow allows). No Domain attribute; use host-only HTTPS origin. Actual cookie name and SameSite policy require local integration tests; avoid embedding secrets in response HTML or JSON.
- Session store: lookup key + one-way SHA-256 verifier digest of a **high-entropy random token**, actor ID, creation/expiry, rotation and revocation metadata; never use bearer token in localStorage/sessionStorage.
- Regenerate or rotate session on login, sensitive reauthentication, password change and risk; revoke on logout/password reset or operator response. Check server-side expiry/revocation on each owner read and write. Bound absolute/idle lifetime; reauthenticate for security settings.
- `Cache-Control: private, no-store` on login, admin, JSON owner endpoints and preview; `Vary` cannot make shared caching of private payloads safe by itself.

## CSRF and origin strategy
Same-origin server-rendered forms require unpredictable per-session CSRF tokens (synchronizer token or rigorously designed double-submit) on all authenticated mutating requests. Check trusted Origin and Fetch Metadata, and reject unexpected content types; SameSite is **defense in depth**, not the entire CSRF mitigation. Auth/login/reset endpoints also enforce origin and abuse controls. Never place CSRF tokens in URLs or public logs. Validate method override and preflight/CORS policy; disallow credentialed `Access-Control-Allow-Origin: *`.

## XSS and HTML serialization
- Treat rich text and Markdown as untrusted; sanitize with context-aware allowlists at presentation/storage boundaries; escape server templates, HTML attributes, JSON-in-script embedding and URLs correctly.
- Candidate strict CSP with nonce/hashed scripts and minimal sources; avoid `unsafe-inline`, test hydration/client bundles. `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, restricted `form-action`, HSTS after HTTPS/domain review, `X-Content-Type-Options: nosniff`, controlled Referrer-Policy and Permissions-Policy.
- Allowlist navigation/redirect destinations; prevent `javascript:`/dangerous schemes and DOM sinks, including media SVG/html uploads (consider rasterizing or disabling risky formats).
- Test XSS in SSR payloads, rich editor, admin notifications and public OG/SEO titles. CSP is a backstop, not XSS sanitization.

## Dangerous edge cases
- Reverse proxy trusts forwarded HTTPS/IP headers only from configured proxies; no arbitrary client `X-Forwarded-*` trust.
- JSON loaders/actions are privately authorized; client hydration data and error boundaries must not serialize sensitive ORM objects.
- Redirects after login validated against same-origin allowlisted paths; `next=//evil.example` rejected.
- Double-submit, stale browser tabs and concurrent edit errors do not skip CSRF or revision preconditions.

## Header policy reference
See `contracts/CANDIDATE_SECURITY_POLICY.yaml`; these settings remain proposed and must pass real browser, OAuth/WebAuthn/TOTP (if selected) and accessibility flows before enabling production.
