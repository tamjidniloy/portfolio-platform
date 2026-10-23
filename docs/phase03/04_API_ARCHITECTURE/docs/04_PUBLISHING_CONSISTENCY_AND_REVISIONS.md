# 03.4.4 — Publishing, Concurrency, Snapshot & Idempotency

### Draft save (owner POST/PATCH)
1. Resolve owner from server session; verify CSRF and object authority. Draft-save validation is intentionally less strict than publish validation but still rejects hostile input.
2. PATCH requires If-Match strong revision token (`"rev-N"`, candidate). Check inside transaction and increment monotonically. A missing header is 428; a stale header is 412.
3. Commit `content_items` + `content_revisions` + `audit_events` atomically (schema names from unapproved Phase 03.3). Server returns `DraftSaved` and updated ETag only after commit.
4. UI maintains unsaved safe text when conflicts occur; never silently merge or claim save succeeded.

### Publish/unpublish
1. Reauthorize owner, CSRF, expected revision, publish-level schema validation and media relationship eligibility.
2. In a DB transaction, snapshot the exact approved private revision into `published_snapshots`; emit audit and durable outbox invalidation records atomically. Do **not** call SMTP/CDN inside SQL transaction.
3. Return `PublishReceipt` with confirmed revision/generation when DB commits. This means authoritative public DB state updated, **not** evidence that all external caches/notifications completed.
4. Disable shared caching on publication-sensitive detail responses until end-to-end safe invalidation is verified. On unpublish, public reader must immediately exclude the record, including anonymous slug path and sitemap.
5. Repeated commands with the same idempotency key + exact payload return the same terminal result; different payload/key collision must yield safe conflict.

### Restore
Restore from historic revision **creates a new private draft revision** and never bypasses current publish checks. Old versions cannot directly become public via a replayed restore request. Redirects require an explicitly validated published target.

### Nonnegotiable invariants
- Public SSR and JSON readers do not join private drafts, contacts, sessions, audit or storage secrets.
- Publishing and cache/index invalidation jobs are separate durability domains; downstream retry cannot corrupt published truth.
- Atomic publication requires revisable snapshots, audit and outbox in the same database transaction, with transaction isolation/concurrency strategy decided through an ADR.
- The candidate 03.3 schema is NOT final; unique constraints, locks and generation tokens must be implemented and tested before actual runtime assertions.

### Example race
Owner A loads rev-7; owner B saves rev-8. A's `If-Match: "rev-7"` publish receives 412; no published change. Browser prompts refresh/review. Rev-8 may be published only after owner explicitly submits a new confirmed command.
