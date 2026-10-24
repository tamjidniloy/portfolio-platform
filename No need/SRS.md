# DEVFOLIO OS — Software Requirements Specification, SRS-R1

**Contract:** SRS-R1 v1.0 • **Status:** OWNER APPROVED for Release 1 engineering baseline • **Approval:** 2026-10-24, Asia/Dhaka • **Source:** owner's explicit acceptance of SRS-R1, AUTH-R1, DB-R1 and API-R1 in the Portfolio Website project chat.

**Scope of approval:** the complete 52 functional and 24 non-functional requirements, revised passkey-first authentication, 19-table PostgreSQL contract, 37-operation API design, `/projects` canonical Work URL and the proposed retention periods. The original Phase 01 v1.1 and Phase 03 candidates remain historical, not authoritative. Engineering completion, real deployment, provider selection and privacy-law review are NOT implied by contract approval.

## 1. Purpose and system boundary

Build a trustworthy, accessible, server-rendered professional software-engineering and AI/ML research portfolio with a secure single-owner CMS. Public visitors can inspect verified work and submit contact messages; only the provisioned owner can edit, publish or preview private content. Owners can update published content without editing application code or redeploying.

**Stakeholders:** recruiters, collaborators, researchers, search engines, single owner and operations administrators (not public application users).

**Stack/constraints:** React 19, React Router 7 Framework Mode SSR, Node 22+, Express 5, JavaScript/JSX, PostgreSQL 16+, native PostgreSQL on Windows 11, npm, WebStorm and Postman. Single-origin modular monolith. No Docker dependency locally or in CI. `pg` runtime query adapter, parameterized SQL and versioned reviewed migration process.

## 2. Scope and priority

**P0 in Release 1:** Home, Work/project case studies, Research and publications grouped under Research, About, Contact, Experience, Education, Skills, Achievements, conditional Writing, optional published Resume and Privacy; protected owner CMS, real passkey login, authorized preview, revisions, publish/unpublish, media and contact inbox, SEO/sitemap, audit, backup/restore, monitoring, accessibility, security.

**P1 enhancements:** filtering/search, open-source showcase, allowlisted nav reordering, availability/cost metrics. **P2 deferred:** speaking, scheduled publication, GitHub autosync, theme preset/light theme, multilingual authoring, public visitor accounts, payments, public chat and multi-owner roles.

**Normative requirement list:** [REQUIREMENTS_CATALOG.md](REQUIREMENTS_CATALOG.md) preserves **FR-001..FR-052** and **NFR-001..NFR-024**, priorities and approved modifications. Every P0 ID must map to repeatable acceptance evidence before release.

## 3. Required business invariants

1. **Public confidentiality:** every public SSR loader/API/sitemap/media request reads only an explicitly published and allowlisted DTO. Anonymous visitors never see draft revisions, private notes, contact PII or credential/session data.
2. **Owner authorization:** every `/admin` and `/api/v1/admin` read/write requires a fresh DB-validated active owner session; all state-changing cookie-authenticated endpoints enforce same-origin and CSRF defenses. No public registration.
3. **Publication:** draft save accepts safe incomplete content; publication validates the exact complete revision and asset permissions. Snapshot, editorial state, redacted audit row and durable outbox event change in **one database transaction**. Respond Published only after commit.
4. **Revision integrity:** immutable numbered JSONB revisions; expected `lock_version` controls optimistic concurrency; stale edits reject without overwriting. Editing published content does not change the published snapshot. Restoring history creates a new private draft.
5. **Unpublishing:** deletes active snapshot atomically; public authoritative readers return 404 without stale shared-cache leaks. No draft preview indexing.
6. **Research truth:** scientific stage is not CMS visibility or peer-reviewed publication. No invented awards, credentials, metrics, results, employment or source links.
7. **Canonical routing:** label Work, canonical `/projects` and `/projects/:slug`; legacy `/work` redirects after migration. Publications are grouped under Research. Writing appears in primary nav only if an eligible published article exists.
8. **Media:** owner-authorized staged upload, server-verified MIME/size/checksum, private storage, no unsafe public links, reference-aware deletion and revocation.
9. **Contact:** store accepted messages separately from outbound-notification status. Avoid claims that SMTP delivery occurred merely because a message was persisted.
10. **Personal data:** minimize collection, display only approved owner data and honor the retention/deletion contract.

## 4. Public and owner routes

**Primary nav:** Work `/projects`, Research `/research`, About `/about`, optional Writing `/writing`, Contact `/contact`. Home `/`, published details `/projects/:slug`, `/research/:slug`, `/writing/:slug`; secondary `/experience`, `/education`, `/skills`, `/achievements`, `/resume` (if enabled), `/privacy`, sitemap/robots/404. Private owner `/admin` and dedicated owner editors. Actual data comes from approved snapshots, not placeholders.

Prelaunch `/work` is not canonical. Preserve an appropriate redirect after migration, update SEO canonical metadata and Postman smoke tests. Private routes must be no-store; previews additionally noindex.

## 5. Identity (AUTH-R1)

The owner authenticates through a registered passkey/WebAuthn assertion requiring **user verification**. The server validates challenge, authenticator signature/public key, RP ID, allowed HTTPS origin, presence/UV, credential/account status and replay. Challenge maximum lifetime 5 minutes. No email-code or email-only recovery. Recommend second passkey and 10 high-entropy offline single-use recovery codes for a restricted recovery ceremony. Server sessions: 256-bit opaque tokens, digest in PostgreSQL, production `__Host-` Secure HttpOnly SameSite=Strict cookie, 60-minute absolute expiry, 15-minute inactivity, recent reauthentication for sensitive actions. Full details in [AUTH_R1.md](../contracts/release1/AUTH_R1.md).

## 6. Persistence (DB-R1)

PostgreSQL 16+, **19 tables**, separate owner/passkey/challenge/session/recovery domains, private revisions and published snapshots, media, contacts, audit/outbox, idempotency, configuration, referential integrity and migration ledger. Immutable versioned DDL with checksum verification, rollback plan, staging restore and independent privileged migration role. Authoritative reference: [DB_R1.sql](../contracts/release1/DB_R1.sql). This approved **schema contract** is not yet a tested, executable production migration.

Per-type versioned JSONB validation: title ≤200 chars, slug ≤160, summary ≤2000, rich editor payload ≤256 KiB, safe external HTTPS links, explicit publication-level required evidence.

## 7. Interface (API-R1)

Versioned `/api/v1`: 37 JSON operations (6 public, 12 auth/security, 10 owner content, 9 media/inbox/settings/audit). React Router SSR loaders/actions remain primary page delivery. JSON UTF-8, RFC 9457 Problem Details errors, strong `If-Match` (412 stale), 428 missing, idempotency keys on specified replay-sensitive mutations, 20-default/50-max bounded collections, no-store private responses, strict published-only anonymous reads. Machine-readable [openapi.json](../contracts/release1/openapi.json) and [API_R1.md](../contracts/release1/API_R1.md).

## 8. Accessibility and quality

Dark-first Phase02-approved tokens background `#10151D`, text `#F1F5F9`, mint `#70D9C3`; no Release 1 light-mode toggle. Target WCAG 2.2 AA verified with keyboard/focus, contrast, feedback and mobile/reflow QA; representative widths 320/360/390/768/1024/1440/1920 CSS pixels; 200% zoom. Performance targets at p75: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1. 99.9% monthly availability is a target, not proof.

## 9. Approved proposed retention defaults

- Contact content: 90 days, unless earlier deletion or documented lawful exception; explicit privacy notice/consent and request handling.
- Expired challenges: 5-minute challenge validity, purge stale rows within 24h; staging media: 24h orphan cleanup.
- Sessions: 15-minute idle/60-minute absolute limits, purge revoked/expired records within 30 days.
- Recovery codes: one use, purge revoked/old batches within 30 days; idempotency records 24h unless a longer specified replay interval is needed.
- Audit events: 365 days subject to law; encrypted backup copies: 30 days with restore drills.
- Content revisions: retain while needed for publication/recovery; erase only under approved referentially sound process.

These are owner-approved **product defaults**, not a legal conclusion. Implement deletion enforcement and confirm privacy notice, jurisdiction, providers, backups and regulatory duties before real collection/deployment.

## 10. Acceptance and exit gates

All 76 requirement IDs trace to test cases. Required: real WebAuthn/passkey enrollment/login/recovery, revoke/rotation/CSRF/rate-limit tests, DB 19-table migration and role-grant tests, no-draft-leakage and publish/unpublish/concurrency/idempotency verification, Postman 37-operation contract checks, WCAG/browser/mobile/performance tests, encrypted backup/restore drill, staging security and production rollout review.

**Owner-approved engineering design does NOT mean Phase 04.1–04.6 implementations are complete or approved for production.**

## 11. Change control

Change any FR/NFR, table, API error/route or data retention with a reviewed revision and acceptance trace. Historical Phase01/03 docs remain as evidence; only Release1 canonical contracts and later owner-approved superseding revisions are normative.
