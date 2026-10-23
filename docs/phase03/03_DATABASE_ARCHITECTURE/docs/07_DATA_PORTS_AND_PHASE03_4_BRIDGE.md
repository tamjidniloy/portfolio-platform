# 03.3.7 — Data Port Mapping and Phase 03.4 API Design Bridge

The 03.2 service ports remain **in-process candidate interfaces**. These table groups are implementation options for repositories, not HTTP contracts.

| Port / use case | Candidate store | Read/write and invariant |
|---|---|---|
| PublishedProjects.list / bySlug | `published_snapshots` | Only published + allowlisted public payload, no draft join |
| PublishedResearch.list / bySlug | `published_snapshots` | Scientific stage in approved payload, no implied peer review |
| PublishedSitemap.entries | `published_snapshots`, `slug_redirects` | Canonical currently published, no private preview URL |
| SaveDraft.execute | `content_items`, `content_revisions`, `audit_events` | Owner, expected version, safe draft-level validation |
| PublishContent.execute | content items/revisions/snapshots + outbox | Atomic version-consistent publishing; server-truth |
| UnpublishContent.execute | content items/snapshots + outbox | Atomic loss of public visibility |
| RestoreRevision.execute | revision history | Copy old data into new unpublished revision |
| Media.request/finalize | `media_assets`, `media_references` | Verified private staging, published link required for public |
| Auth.password/email challenge | `admin_users`, `auth_challenges`, `admin_sessions` | TTL/one-use, no session before verified code |
| Contact.submit | `contact_messages`, `outbox_events` | Store independently from eventual email outcome |
| UnitOfWork.run | repository adapters | Transaction + outbox with rollback semantics |
| Policy.authorize | owner session + domain context | Server-side deny-by-default |

## What Phase 03.4 may specify
- Proposed SSR route loader/action and HTTP interface inventory, request/response DTO allowlists, CSRF and auth denial states, cursor semantics and idempotency.
- Public canonical content and stable slugs, responsive errors and no-store private preview contracts.
- Data types, validation and response codes remain candidates until SRS approval, not fixed by an ERD.

## Hard stop
Do not merge/migrate a binding physical schema or freeze API response shapes until: owner-approved authoritative SRS, owner-reviewed ADRs, and explicit change impact on Phase 02 design/requirement tests.
