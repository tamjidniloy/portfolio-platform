# 03.7.3 — Security Boundaries and Critical Data Flows

## Trust boundary inventory
| Boundary | Allowed | Denied / incident scenario | Implementation evidence |
|---|---|---|---|
| Browser → HTTPS edge | SSR public pages and protected request flow | Direct access to DB, storage credentials, admin secrets | TLS/header/cookie and negative tests |
| Anonymous route → public facade | Allowlisted published content and canonical sitemap | Drafts/revisions/private PII, unpublished media | SSR/raw fetch/JSON/cache/sitemap negative tests |
| Owner request → session policy | Verified actor with object authorization and CSRF | Anonymous mutations, stale or revoked sessions | Auth/security integration |
| CMS → Postgres | Transactional draft/revision/published snapshot/outbox writes | Partial publish commits and lost updates | Rollback, conflict and transaction tests |
| CMS → media store | Private staging, verified signature/size/ownership | Direct arbitrary upload/public orphan/deletion | Upload/ACL tests |
| Contact → inbox/outbox | Validated single insert and delivery intent | Fake delivered confirmation and PII in logs | Failure injection and privacy review |
| CI → deploy | Least privilege review + immutable artifacts | Untrusted PR gaining production credentials | GitHub plan/capability and IAM assertions |
| Backup vault → restore | Isolated, auditable encrypted restore | Production data exposure or untested RTO claim | Real isolated drills |

## Sequence A — Published public query
`anonymous -> route loader -> published-only query/DTO -> PostgreSQL projection -> raw SSR/JSON -> safe cache`. API and sitemap must share published-state semantics. Unpublished URLs are inaccessible regardless of guessed IDs/slugs.

## Sequence B — Draft → preview → publish
`owner -> session+CSRF+object authorization -> save draft (validation + version) -> DB commit/revision/audit -> private preview (no-store, noindex) -> publish preflight -> single transaction(public snapshot + revision + outbox) -> confirmed response -> retryable outbox event -> cache/sitemap revalidation`. The outbox cannot grant public visibility on its own.

## Sequence C — Credential and recovery
Historical password→emailed one-use challenge must **not** be represented as a compliant phishing-resistant MFA mechanism. Owner must choose a formally reviewed alternative (passkey/WebAuthn or TOTP candidate) and update requirements or explicitly accept limited assurance. Issue a server session only after complete verified ceremony, rotate on privilege change, revoke on logout/recovery, never log reusable credentials.

## Sequence D — Release and incident
`trusted commit -> CI lint/unit/security -> immutable artifact digest/SBOM -> staged deploy -> migration compatibility check -> smoke/security -> explicit approval -> production rollout -> telemetry -> rollback if needed`. Approval gates may need independent audited mechanisms if repository plan does not enforce them.
