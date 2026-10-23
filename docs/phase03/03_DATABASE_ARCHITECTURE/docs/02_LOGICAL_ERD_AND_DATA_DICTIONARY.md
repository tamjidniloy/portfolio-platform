# 03.3.2 — Logical Relationships and Data Dictionary

## Proposed catalog
The design contains **18 candidate SQL tables**, **116 fields** and **17 mapped conceptual relationships**. Every row has stable table/column/constraint information in `matrices/DATA_DICTIONARY.csv`. Values, exact types and keys remain provisional.

### Four trust/data groups
1. **Owner secret/private tables:** `admin_users`, `auth_challenges`, `admin_sessions`, `password_reset_tokens`, `site_private_config`. These must never be loaded into public SSR or API responses.
2. **Private content source tables:** `content_items`, `content_revisions`, `content_relations`, `content_tags`, `media_references`. Although metadata may be safe by itself, public routes must not query them directly.
3. **Public allowlisted projection:** `published_snapshots` with canonical `public_path`, publication revision FK and `public_payload`, plus safe derivative media access. Anonymous reading is through a server-side published query facade, not direct SQL credentials.
4. **Privacy/operations:** `contact_messages`, `audit_events`, `outbox_events`, `idempotency_keys`, `media_assets`, `slug_redirects`, `tags`.

## Essential PK/FK and uniqueness proposals
- UUID primary keys for content/admin/media/contact/outbox; `content_revisions` composite PK `(item_id, revision_no)`.
- `published_snapshots.item_id` is PK/FK; `(item_id,source_revision_no)` composite FK ensures snapshot refers to a version of that item.
- Unique `published_snapshots.public_path` prevents public route collisions across content types (not just project slugs).
- `content_relations`, `content_tags`, `media_references` link to the **revision**, not a mutable editor record alone; revision-bound joins avoid showing draft-only links with published pages.
- Owner session and one-time credential digests unique; prevent plaintext codes or tokens in DB.
- Outbox `dedupe_key` unique and worker claim leases scoped; at-least-once delivery must use idempotent consumers.
- `slug_redirects.from_path` unique; loops, chain limits, and currently-active target validation require service-level enforcement.
- `idempotency_keys(scope,key_digest)` unique to handle request replay; no sensitive response values stored.

## Intentional DB-level limitations
PostgreSQL cannot verify arbitrary JSONB field sizes/URL safety/WCAG/content authenticity from these tables alone. Proposed service validation uses per-`content_type`, versioned schemas and a separate **public DTO allowlist**. Any later API/ORM schema must retain the hard privacy and publication rules.

## Index approach
Critical indexes cover public path, content type/state/editor update order, revision (item,rev), sessions/challenges TTL, outbox available work, message privacy retention and media references. Migration must use `1CREATE INDEX CONCURRENTLY` outside transaction for large production tables if later required; never assume online impact zero. Query plan/traffic evidence will determine actual indexes.

## Relationship authority
`matrices/RELATIONSHIP_MATRIX.csv` states FK and service-enforced (logical) relationships separately. Logical constraints not enforced by foreign keys are explicitly identified and must receive automated integration tests in Phase 04.
