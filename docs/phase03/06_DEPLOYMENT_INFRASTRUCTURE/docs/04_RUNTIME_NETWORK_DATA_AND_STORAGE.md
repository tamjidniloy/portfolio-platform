# 03.6.4 — Runtime and dependency reliability

SSR + Express hosts public published queries and strictly separated owner command/read routes; do not use client-side route hiding as authorization. Separate outbox worker consumes only committed intents, with idempotent retries, exponential backoff and bounded dead-letter; mail failures may not be acknowledged as delivered. Owner email OTP failure may not bypass login requirements. A future owner-chosen MFA alternative may change these interfaces.

Managed PostgreSQL: private endpoint, TLS, per-role grants, pool size/backpressure, migrations preflight, isolated backup/recovery and strict visibility boundaries. Database outage yields honest user error, never leaked draft fallback or cache spill. Postgres WAL archive monitoring required for PITR; logical dump alone is not PITR.

Object storage: only signed/authorized private staging, server verifies MIME/size/hash and owner, published derivatives served through reference-aware authorization or safe revocable delivery. Separate staging/prod buckets, versioned backup and orphan cleanup. Expired/revoked published files must not remain available as permanent CDN cache entries.

Network/edge: secure HTTP headers and origin/CSRF policy, TLS renew, DNS ownership, SPF/DKIM/DMARC setup, published-only sitemap; do not prematurely enable global HSTS preload. Observability must not capture OTPs, session tokens, draft bodies or visitor messages. No persistent user content stored only in ephemeral application filesystem.
