# Release 1 — Owner Contract Acceptance Record

**Approval status:** APPROVED FOR ENGINEERING IMPLEMENTATION.
**Owner approval communicated:** 2026-10-24 (Asia/Dhaka), in the ChatGPT Portfolio Website project conversation. The user stated: **“Asa owner, I am giving you the full and complete approval and acceptance of all.”** This is recorded as explicit acceptance of the immediately preceding complete SRS-R1, AUTH-R1, DB-R1 and API-R1 proposals.

## Approved scope
1. **SRS-R1:** Release 1 scope, all FR-001..FR-052 and NFR-001..NFR-024, design/priority reconciliation and the documented FR-039/040/042, NFR-005/021 WebAuthn amendments.
2. **AUTH-R1:** WebAuthn/passkey-first with mandatory UV; additional passkey, restricted offline recovery-code procedure; no emailed OTP; session/token/CSRF/revocation/reatuhentication rules.
3. **DB-R1:** PostgreSQL 16+ 19-table reference contract, revisions, published snapshots, safe privacy boundary, proposed data-retention defaults and independently versioned reviewed migration approach.
4. **API-R1:** `/api/v1` 37 JSON operations and associated SSR/resource routes, passkey endpoints replacing historical email/password challenge operations, canonical `/projects` Work URL, origin/CSRF/precondition/idempotency/error semantics.
5. **Retention and infrastructure:** proposed 90-day contact, 365-day audit, 30-day encrypted backups and other durations become accepted product defaults, subject to actual privacy/legal review and provider agreements. Native PostgreSQL, Windows 11, npm, WebStorm, no Docker.

**Approved by:** the user acting as project owner (no assumed real-world name, signature or externally verified identity).
**Evidence form:** in-conversation explicit acceptance; NOT an electronically signed SHA or GitHub approval stamp.

## Implementation status is separate
This record authorizes engineering implementation; it is NOT proof of migrations executed, authenticators verified, all APIs deployed, backups restored, data-retention jobs enforced, WCAG achieved or production readiness. Existing Phase03 candidate documents and 18-table migration validation remain historical proposals/test fixtures, not authoritative. Do not run the new 19-table schema in production until an executable migration has passed staging and deployment review.

## Conflict resolutions
- Passkeys replace password + emailed OTP as the intended owner sign-in; FR-039/040/042 and NFR-005/021 revised accordingly.
- Public Work canonical `/projects`; legacy prelaunch `/work` redirects after route cutover.
- 19 owner-approved DB tables replace the older 18-table proposal.
- 37 Release 1 JSON API operations replace the old 29-operation candidate.
- Writing nav is conditional, publication != academic peer-review.
- Theme presets remain P2; approved Release 1 is dark-first.

## Governance
Changes to any of these contracts require another recorded owner decision. GitHub code merge and runtime QA/release approvals are distinct from this owner product-contract approval.
