# 03.3.6 — Published Queries, Search and Indexing

## Query boundaries
**Public:** `PublishedContent.byPath`, `PublishedProjects.list`, `PublishedResearch.list`, `PublishedSitemap.entries`, implemented against `published_snapshots` plus only safe indexed metadata or public payload. No public route imports repositories exposing draft JSONB, sessions or contact messages.
**Private:** owner-only revision and editor queries after authorization, CSRF for mutations. Contact inbox is strictly private and never serialized to public HTML, hydration or logs.

## Candidate indexes and benchmarks
- `UNIQUE (public_path)` is essential for public case study/research/article route lookup.
- `content_revisions PRIMARY KEY (item_id, revision_no)` for history and referential safety.
- Admin collection index `content_items (content_type, updated_at DESC)` for owner-only sorting; fields and query volume not finalized.
- `outbox_events (available_at, created_at) WHERE processed_at IS NULL` for worker claims; lease expiration included in work selection.
- `admin_sessions (admin_user_id, expires_at)` for revocation; `auth_challenges (admin_user_id, expires_at)` and message retention index.
- Public filters/search: optional GIN/trigram/materialized index considered only after requirements and realistic query profiles; JSONB GIN indiscriminately can hurt writes and add cost.

## Benchmark/evidence plan
- Use `EXPLAIN (ANALYZE, BUFFERS)` in a safe staging dataset after PostgreSQL exists; record plan and row counts for list, detail, sitemap, admin editor, outbox claim, media eligibility.
- Test abusive search inputs, cursor pagination, huge text fields, overlapping writes and cache after unpublish.
- Use CDN/shared cache only after invalidation and anonymous draft-negative tests. Private preview and admin pages always no-store.
- Phase 01 NFR-004 Web Vitals target is an end-user performance measure; SQL query speed cannot alone assert CWV compliance.

**No execution, timings or performance PASS claims in Phase 03.3.**
