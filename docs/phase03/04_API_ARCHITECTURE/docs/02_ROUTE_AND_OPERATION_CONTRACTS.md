# 03.4.2 — HTTP Route & DTO Contract Inventory

## Scope and cardinality
- **41** UI/SSR routes including public pages, admin UI, XML and binary resource routes.
- **29** proposed JSON resource operations across **26** paths in `api/openapi-3.1.2-candidate.yaml`.
- An identical business capability may be invoked by a loader/action OR JSON resource route; enforce the SAME service/authorization contract; choose one canonical mutation transport at implementation, avoid inconsistent double write paths.

## Public requirements
- Project/research detail by slug: 200 iff published and eligible, 404 for missing/private. Never return publication draft state, owner emails, internal storage keys or authenticated redirects to anonymous clients.
- Research stage and CMS publication state are distinct. No false claims of peer review or invented user portfolio evidence.
- Writing navigation is conditional on published articles, yet a no-content collection may show a transparent empty state according to approved IA; Article CRUD remains available to owner.
- `PublicContent` is a **minimal allowlist example**, not all final content fields. No dynamic `SELECT *` or free-form DB `JSONB` objects get serialized publicly.
- Public collection cursor is opaque, signed/scoped to filters and stable sort key; enforce server max limit (candidate 100) and reject cursor reuse across different filters.

## Private requirements
- `PrivateDraft` may carry CMS editor payload **for verified owner only**; exposed fields must be allowlisted per content type and not include token hashes/secrets.
- Owner session must be checked on all owner reads and writes. Separate authorization by function and object; the client cannot send/override `actorId`.
- `If-Match: "rev-SessionCreated"` is a **candidate** revision guard for PATCH, publish, unpublish, restore and settings. Missing precondition -> 428; stale -> 412; domain/business conflict -> 409. Durable transaction commit is the boundary of success.
- `Idempotency-Key` is required on proposed POST mutations and public contact. Scope by actor/session + method/path + request fingerprint; same key different body rejects, expiry/storage policy decided by ADR. This is not a replay defense for OTPs.
- `DELETE` message returns 204 only after confirmed retention-aware deletion, not merely queue receipt. Destructive action is separately confirmed in UI and audited.
- Public and private APIs are separate tags/security policies in OpenAPI. Resource routes are not automatically CORS-enabled.

## React Router mapping
- `/projects`, `/research`, `/about`, etc. route `loader`s provide SSR-safe public DTOs and metadata. A resource route with `loader`/`action` but no default component can return JSON, XML, PDF or other data. GET handled by loader; non-GET by action, subject to method dispatch.
- Owner loaders and actions call the same port as their resource-equivalent; avoid leaking session-expired private loader JSON during server-side rendering.
- Redirect and sitemap responses derive only from a centralized public snapshot query. Privileged preview loader needs `Cache-Control: private, no-store` and `X-Robots-Tag: noindex, nofollow`.
- Use typed response helpers only for server-confirmed result; no browser-only confirmation after a failed commit.

## HTTP response conventions
| Status | Candidate meaning |
|---|---|
| 200 | Read or confirmed update response |
| 201 | Confirmed newly created draft/contact/upload intent |
| 202 | Accepted generic auth challenge/recovery request, no disclosure of mailbox existence or delivery confirmation |
| 204 | Confirmed no-body logout/deletion |
| 400 | Bad request/invalid transport syntax |
| 401 | Owner session absent/expired or auth challenge failure (safe generic details) |
| 403 | Verified actor lacks permission or CSRF fails (avoid privilege leak) |
| 404 | Public missing/unpublished is indistinguishable; admin missing safe error |
| 409 | Domain/idempotency conflict, not ordinary stale revision |
| 412 | Explicit If-Match revision mismatch |
| 422 | Valid JSON but invalid business inputs |
| 428 | Required revision precondition missing |
| 429 | Rate limit exceeded; safe Retry-After where permitted |
| 503 | Dependency unavailable; never claim success |

## Explicit deferrals
OpenAPI is machine-readable **proposal**, not a guarantee that any `/api/v1/*` URL will ship. Long-lived public APIs, record shapes, upload MIME/byte limits, media serving, exhaustive settings fields, retention schedules, OTP TTL and status-code conventions require owner/ADR confirmation.
