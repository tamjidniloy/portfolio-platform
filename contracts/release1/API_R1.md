# API-R1 — Release 1 JSON API and SSR Interface

**Status:** OWNER APPROVED specification as of 2026-10-24, Asia/Dhaka. **Source:** [openapi.json](openapi.json), OpenAPI 3.1.2, **37 operations**; this is NOT a claim that routes are implemented or deployed.

## Normative API and error rules

- Same-origin `/api/v1`, UTF-8 JSON except explicit resource/media routes. React Router 7 Framework SSR loaders/actions handle rendered pages.
- Anonymous public read is strictly from validated allowlisted published snapshots. Draft/private and missing URLs share indistinguishable 404 outcomes; previews never publicly indexable.
- Owner routes demand a DB-verified active session. Cookie-authenticated mutations require exact Origin and per-session CSRF token, plus recent verified WebAuthn for sensitive credential operations. All owner/auth data `no-store`.
- Collection pagination default limit 20, maximum 50, opaque next cursor. Canonical Work is `/projects` (prelaunch `/work` redirects on cutover).
- Strong ETag `"lock-v3"`; versioned PATCH/publish/unpublish/restore/settings changes require `If-Match`, 428 if absent, 412 on stale conflicts. `Idempotency-Key` required for marked replay-sensitive writes.
- Successful JSON responses 200/201/202, 204 empty. Errors: RFC 9457 `application/problem+json` with safe `title`, `status`, `detail`, `code`, `requestId`; 400/401/403/404/409/412/413/415/422/428/429/500/503.
- Contact receipt `received` means stored, not delivered email; `queued` only means durable outbox event.
- WebAuthn start/verify and owner passkey enrollment/credential operations replace password+emailed OTP endpoints. A recovered code creates a restricted recovery context, never a normal owner session.

## Approved operation inventory

| # | Method | Path | Access |
|---|---|---|---|
| 1 | `GET` | `/api/v1/public/projects` | public |
| 2 | `GET` | `/api/v1/public/projects/{slug}` | public |
| 3 | `GET` | `/api/v1/public/research` | public |
| 4 | `GET` | `/api/v1/public/research/{slug}` | public |
| 5 | `GET` | `/api/v1/public/site` | public |
| 6 | `POST` | `/api/v1/contact` | anonymousWrite |
| 7 | `POST` | `/api/v1/auth/passkey/options` | auth |
| 8 | `POST` | `/api/v1/auth/passkey/verify` | auth |
| 9 | `POST` | `/api/v1/auth/logout` | owner |
| 10 | `POST` | `/api/v1/auth/recovery/start` | auth |
| 11 | `POST` | `/api/v1/auth/recovery/complete` | auth |
| 12 | `POST` | `/api/v1/admin/passkeys/options` | recent |
| 13 | `POST` | `/api/v1/admin/passkeys` | recent |
| 14 | `GET` | `/api/v1/admin/passkeys` | owner |
| 15 | `DELETE` | `/api/v1/admin/passkeys/{id}` | recent |
| 16 | `POST` | `/api/v1/admin/recovery-codes/rotate` | recent |
| 17 | `GET` | `/api/v1/admin/sessions` | owner |
| 18 | `DELETE` | `/api/v1/admin/sessions/{id}` | owner |
| 19 | `GET` | `/api/v1/admin/session` | owner |
| 20 | `GET` | `/api/v1/admin/content` | owner |
| 21 | `POST` | `/api/v1/admin/content` | owner |
| 22 | `GET` | `/api/v1/admin/content/{id}` | owner |
| 23 | `PATCH` | `/api/v1/admin/content/{id}` | owner |
| 24 | `GET` | `/api/v1/admin/content/{id}/revisions` | owner |
| 25 | `POST` | `/api/v1/admin/content/{id}/publish` | owner |
| 26 | `POST` | `/api/v1/admin/content/{id}/unpublish` | owner |
| 27 | `POST` | `/api/v1/admin/content/{id}/restore` | owner |
| 28 | `GET` | `/api/v1/admin/content/{id}/preview` | owner |
| 29 | `GET` | `/api/v1/admin/media` | owner |
| 30 | `POST` | `/api/v1/admin/media/intents` | owner |
| 31 | `POST` | `/api/v1/admin/media/{id}/finalize` | owner |
| 32 | `DELETE` | `/api/v1/admin/media/{id}` | owner |
| 33 | `GET` | `/api/v1/admin/messages` | owner |
| 34 | `DELETE` | `/api/v1/admin/messages/{id}` | owner |
| 35 | `GET` | `/api/v1/admin/site-settings` | owner |
| 36 | `PATCH` | `/api/v1/admin/site-settings` | owner |
| 37 | `GET` | `/api/v1/admin/audit` | owner |

## SSR/UI

41 approved planned SSR/UI routes: [SSR_UI_ROUTES.csv](SSR_UI_ROUTES.csv). Primary Work label links to `/projects`, Research `/research`, About `/about`, conditional Writing `/writing`, Contact `/contact`; public details only for published content. Historical `/admin/email-challenge` is replaced by `/admin/passkey`; current prelaunch route code still needs migration.

## Status and acceptance

The OpenAPI schema is a machine-readable *target*: it must gain fully constrained per-content-type schemas as implementation proceeds. No route should be claimed implemented until validated runtime owner/passkey/CSRF/recovery behavior, negative access testing, idempotent publication and Postman/OpenAPI tests pass. All 37 operations remain an approved Release 1 scope.
