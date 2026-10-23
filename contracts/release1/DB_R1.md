# DB-R1 — Approved PostgreSQL Data Contract

**Owner approval:** 2026-10-24, Asia/Dhaka. **Reference DDL:** [DB_R1.sql](DB_R1.sql). **Implementation status:** NOT YET MIGRATED or QA-verified; this is a normative target specification, NOT an executable migration or authorization to apply SQL directly to live data.

## Model (19 tables)
**Credential custody:** `admin_users`, `webauthn_credentials`, `auth_challenges`, `admin_sessions`, `recovery_codes`. Password/email OTP are not primary owner authentication. One owner is provisioned through restricted bootstrap; future multi-owner access is out of scope.

**Private revisioned content:** `content_items`, `content_revisions`, `content_relations`, `content_tags`, `media_references`. Owners can edit drafts without changing a published revision.

**Published projection:** `published_snapshots` is the sole authoritative public content read source. Its public JSONB is built only by a versioned, field-allowlisted server-side mapper; public readers never touch the private JSONB revisions.

**Operations/privacy:** `tags`, `media_assets`, `slug_redirects`, `contact_messages`, `audit_events`, `outbox_events`, `idempotency_keys`, `site_private_config`.

## Core consistency

1. Rows have UUID identities except the composite revision/relationship keys and audit identity. Immutable revisions are addressed by `(item_id, revision_no)`.
2. `published_snapshots(item_id, source_revision_no)` references a real immutable source revision. `public_path` is unique across content types.
3. Save/publish/restore/unpublish acquire a content row lock; check strong `lock_version` precondition, run validation and commit snapshot/content state/audit/outbox as one SQL transaction. On failure roll back all; never return an uncommitted success.
4. Revision references to media and tags are revision-scoped. No public media proxy may serve retired or draft-only media references.
5. Anonymous readers must use an allowlisted published facade with narrowly scoped DB credentials; no runtime public grant for draft/contact/owner credential tables.
6. Idempotency receipt scope+digest uniqueness protects retry-sensitive mutations; outbox worker is idempotent and never embeds sensitive contact bodies/credentials.
7. Audit metadata must be redacted; safe provenance and immutable fields must be enforced by service logic + tests where SQL constraints cannot express cross-table rules.

## Auth and privacy

- `webauthn_credentials.public_key` and `credential_id` hold *public* credential material; `auth_challenges.challenge_digest`, session `token_digest`, recovery `code_digest` store verifiers only.
- Recovery codes grant restricted recovery context on consumption, NOT a full owner session.
- Contact names/email/body are private; consent timestamp and privacy-notice version are recorded. `retention_until` supports default 90-day cleanup with documented exceptions.
- 365-day audit, 30-day encrypted backup, 24-hour staging, short-lived auth/recovery, and long-lived content-revision defaults follow the approved SRS. Legal review and enforced retention jobs are required for production.
- Runtime credentials, password/key material and provider secrets belong in secret infrastructure, never the config JSONB.

## Content schema/versioning

Payload per content type is a versioned JSON Schema/validator; draft-safe incomplete records are distinct from publish-ready required evidence. Default validated limits: title 200 characters, slug 160, summary 2,000, rich JSON 256 KiB and safe HTTPS URLs. SQL JSONB object constraint is **not** sufficient.

## Versioning and execution

Approved scope: **19-table DB model**. Migration binaries and production execution are a separate engineering gate. Baseline implementation will use immutable numbered checksummed migrations with independently privileged migration role and bounded lock times; migrations are never auto-executed at request or startup. Test migration from clean native PostgreSQL 16, idempotent rerun, foreign key/no-leakage, backup/restore, role grants, service compatibility, safe rollback (especially destructive changes) and staging. The existing `db/candidate_migrations/0001_phase03_proposed_baseline.sql` is HISTORICAL 18-table disposable QA fixture; it does NOT implement DB-R1.
