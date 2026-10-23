# 03.3.3 — Versioning, Publication Invariants, Isolation and Outbox

## Content invariant lifecycle
1. **Create/Save draft:** authenticate/authorize owner, validate draft-safe fields, check `expectedLockVersion`, insert next immutable `(item_id, revision_no)` payload, advance `content_items.latest_revision_no` and `lock_version`, add redacted audit row; commit before reporting saved.
2. **Preview:** authenticated owner reads a specified revision; no-store, noindex; never create a public snapshot or index entry.
3. **Publish:** authorize, publish-level validate the **exact revision** and referenced assets, lock/compare expected item version, `INSERT ... ON CONFLICT ... DO UPDATE` `published_snapshots` (safe allowlisted DTO and unique canonical route), update editorial publication state, audit, durable outbox event **in the same DB transaction**; success after commit only.
4. **Edit published:** creates new private revision and does **not** change published snapshot; remains public at prior approved version until republished.
5. **Unpublish:** lock/compare revision, delete current published snapshot, change editorial state, write audit/outbox, commit. Public fallback must consult DB; no stale shared cache can serve removed content.
6. **Restore revision:** creates an immutable new draft revision of an older source, never silently rolls back a public snapshot or bypasses validation.

## Transactions/isolation
- Candidate default `READ COMMITTED` with row locking (`SELECT ... FOR UPDATE`) and expected `lock_version`; atomic DB commit for snapshot/revision/audit/outbox changes.
- Unique index on `public_path` prevents concurrent published slug duplicates. Translate conflict to validation/conflict feedback, not 500 with private details.
- If incoming command is retried: compare idempotency key and request digest; never publish twice or duplicate notifications. Post-commit queue work is at-least-once with idempotent consumer.
- External side effects (email, storage promotion, CDN purge) **must not** happen inside SQL transaction; worker reads durable outbox and handles retries/dead letters.
- Outbox may lag; for publish-sensitive pages default **no shared caching** until a safe invalidation proof exists. DB published projection is authoritative for unpublish.

## Media and redirects
- Draft media objects staged private; only after signature/size/security checks may metadata enter `ready`; public download adapter must validate link to a **currently published** snapshot revision.
- Avoid long-lived public or pre-signed media URLs that survive unpublish. Storage/caching provider rules require separate explicit approval.
- Old slugs may redirect to published canonical targets only; unpublished targets or loops must fail safely, not reveal private content.

## Failure matrix
| Failure | DB guarantee | User-visible truth |
|---|---|---|
| Stale expected revision | No write to revisions/snapshot | CONFLICT; allow safe reload/merge |
| Validation or forbidden asset | Transaction abort | Not published; show exact safe field errors |
| DB outage/failed commit | No success; no published transition | Retry guidance; don't fake success |
| Outbox worker down | DB publication state stays durable | Public visibility obeys DB; worker retries |
| SMTP notification fails | Contact message remains saved | Message received, *not necessarily notified* |
| CDN invalidation delayed | Public reader authoritative; conservative cache | Never expose newly unpublished data |

See `schema/03_TRANSACTION_EXAMPLES.sql` for illustrative SQL pseudocode, **not tested against PostgreSQL**.
