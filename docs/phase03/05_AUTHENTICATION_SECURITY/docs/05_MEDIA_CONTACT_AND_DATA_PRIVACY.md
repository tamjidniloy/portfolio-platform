# 03.5.5 Media, Contact, PII, and Data Deletion

## Media pipeline
1. Owner session + CSRF + quota → short-lived private staging intent, limited type/size and identity; do not expose broad bucket credentials.
2. Upload privately; verify actual bytes, MIME sniff/signature, length, digest and ownership. Reject polyglots/executables/SVG-with-script and oversized/bomb payloads. Decide AV scanning/quarantine provider via ADR.
3. Finalize metadata after actual object verification; attach to authenticated draft; public derivatives only after published referencing snapshot is committed.
4. Public media delivery checks approved published references or uses immutable **public derivative copies** that cannot expose staged drafts. No arbitrary object-key proxy, no presigned private URL in public HTML or SEO data.
5. On unpublish, remove public eligibility; revoke signed access as feasible and define CDN TTL for public derivatives; physical deletion deferred until live references cleared and retention policy authorizes it. Clean orphan uploads separately.

## Contact and abuse
Validate name/email/message length against approved SRS (not the 147-field provisional UI catalog), apply anti-spam/rate limits, optional challenge with accessibility fallback, and store one message idempotently. A successful store response must **not** claim the notification email was delivered. Private inbox access only for active owner; preserve structured audit without full message bodies.

## Data minimization and retention gates
`contact_messages`, admin email, IP/device context (only if necessary), session records, audit events, media and backup archives have distinct legal purposes and retention policies. Record collection justification and deletion/DSAR procedure; don't set arbitrary retention durations without owner/region review. Avoid analytics by default until privacy decision. Backups may retain records until cycle expiration; disclose this in deletion policy.

## Threat scenarios to test
Contact enumeration, repeated form POST, stored XSS in contact body, HTML mail injection, media upload URL reuse, asset ID BOLA, draft media leak through CDN, oversized image decompression, orphan deletion races, unrestricted redirects, retention overrun, PII appearing in Sentry/logs, and backups leaked via artifact links.
