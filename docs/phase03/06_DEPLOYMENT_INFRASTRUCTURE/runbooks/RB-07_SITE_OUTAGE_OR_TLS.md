# RB-07 — HTTP/TLS outage
**Trigger:** synthetic public route alarm, TLS cert expiry, DNS misroute, app OOM, 5xx spike. **Status:** planned, NOT_DRILLED.
1. Check DNS, cert, provider status, origin health, DB readiness, rate limits, deployment digest and recent config changes.
2. Contain: pause deployments; avoid serving stale admin or draft HTML via CDN fallbacks. If safe, roll back binary to last compatible digest.
3. Restore TLS/cert under controlled provider access; no `--insecure` user-facing bypass or secret in debugging logs.
4. Smoke test public published SSR, auth/login deny, mobile critical routes, CSP/HSTS, privacy/cache headers, and contact truthful receipt.
5. Record duration and evidence; tune alerts and ensure certificate rotation monitoring.
