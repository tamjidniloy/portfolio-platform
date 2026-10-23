# 03.3.1 — Database Scope, Alternatives and Conceptual Model

**Document maturity:** Candidate technical design. Owner has approved Phase 03.2 component *design only*; NOT the SRS nor this database schema.

## Architectural input
- One origin: React Router Framework Mode SSR, custom Express host (proposal); in-process domains, PostgreSQL as candidate system of record.
- Phase 03.2 ports: PublishedProjects/Research safe reads; SaveDraft/Publish/Unpublish/Restore private commands, version check, UnitOfWork, outbox and authenticated preview.
- Phase 02: public published-only data; truthful research status distinct from CMS publication; conditional Writing nav; server-confirmed status; native Penpot/WCAG QA remains pending.
- FR-001–FR-052 and NFR-001–NFR-024 are *candidate* requirements; exact validators/retention/visibility not final.

## Alternatives evaluated
| Alternative | Strengths | Risks / decision |
|---|---|---|
| A. Dedicated relational tables and version/history per type | Strong DB constraints and queryability per field | High edit/publish duplication, schema churn for provisional 147 design fields; many public queries join draft tables |
| B. All content in mutable JSON documents | Flexible authoring | Weak referential integrity, fragile indexing, high risk of accidentally serving drafts |
| **C. Relational custody + immutable revision JSONB + explicit published snapshot** | **Chosen as design candidate**. Strong ownership/media/link/concurrency FKs and single published-only read source; flexible type-specific payloads | Must implement strict per-type runtime schemas and safe DTO projection; DB cannot enforce every JSON field invariant |

**Candidate** is C, not final. An approved SRS or query plan could justify switching to a hybrid typed extension table per domain. Do not interpret JSONB as authorization.

## Conceptual entities
**Owner security:** `AdminUser`, `AuthChallenge`, `AdminSession`, `PasswordResetToken`.
**Content publishing:** `ContentItem` (typed aggregate), `ContentRevision` (private immutable edits), `PublishedSnapshot` (current public-safe representation), `ContentRelation`, `Tag`, `ContentTag`, `SlugRedirect`.
**Assets:** `MediaAsset` (private staged/verified metadata), `MediaReference` (specific revision usage).
**Communication/operations:** `ContactMessage`, `OutboxEvent`, `AuditEvent`, `IdempotencyKey`, `SitePrivateConfig`.

**Public conceptual types**, primarily represented by `content_items.content_type` and validated JSONB revisions: profile, site settings, project, research, publication, article, education, experience, skill, achievement, social link, resume, open-source contribution. These are domain types, not automatically 13 separately deployed databases or 13 tables.

## Cardinalities and interpretation
One ContentItem has many ContentRevisions; zero or one active PublishedSnapshot; each PublishedSnapshot references **an existing revision on the same item**. Revision relations and media references are scoped to a specific revision. Tags can attach to a revision. One owner has sessions/challenges/reset tokens; one contact creates at most a notification intent, which the outbox worker may retry.

## Public state distinction
- `content_items.publication_state` is an editorial state; authoritative anonymous visibility requires a matching row in `published_snapshots` (and an active permitted media reference).
- Editing a published item creates a private new revision; **public content stays on the previous approved snapshot** until a new explicit publish.
- Authenticated private preview reads a versioned revision by owner policy; preview is a view mode, not a durable publication state.
- Unpublishing must remove/disable public snapshot inside one transaction before acknowledging success; caches should not serve unverified stale private data.

## SRS review decisions required
Approve or amend: allowed content types and required fields; publication-versioning strategy; multilingual/type-specific schema; media object-store rules; contact consent/retention; slug/redirect behavior; single owner/account recovery; auth/session timeouts; provider/regional/backup budget. **All remain OPEN until explicit owner decision.**
