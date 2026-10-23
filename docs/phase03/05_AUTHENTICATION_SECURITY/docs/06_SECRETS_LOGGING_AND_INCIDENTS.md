# 03.5.6 Operational Security, Secrets, Supply Chain and Incident Handling

## Privileged infrastructure
Use separate production/staging app credentials, migration credentials and outbox-worker credentials with least privileges. DB, object storage and email API secrets come from an external secret store or protected hosting environment; never `.env` secrets committed to Git or exposed in React client bundles. Rotate keys with version overlap and tested session invalidation; audit rotation. CI workflows run with minimal repo permissions and pin trusted actions/dependencies, dependency scans and secret scans.

## Audit and log events
Candidate events: password_attempt_denied, challenge_issued (without code), challenge_rejected, login_success, recovery_started/completed, session_revoked, admin_access_denied, draft_saved, publish/unpublish, revision_restored, media_rejected, contact_spam_rejected, privacy_delete, export, credential_rotated. Include event ID, coarse time, request correlation, actor pseudonym, action, outcome, resource class; redact credentials, email challenge/code, tokens, full contact data and unpublished document bodies. Security alerts should be bounded to avoid enumerating actual owner addresses.

## Monitoring and response
Alert on credential stuffing, unusual challenge sends, repeated 401/403/CSRF denials, leaked public draft evidence, mass publish/unpublish, media abuse, invalid signatures, secret scanning incidents, backup failure and mail-provider outage. Runbook: triage → contain/revoke sessions, OTP, credentials → halt unsafe routes/publishing → preserve safe evidence → patch and restore → validate public/private boundaries → owner notification and retrospective. Breach notification timelines/legal requirements need separate owner/local counsel decision; not defined here.

## Backups and recovery
Encrypted DB backups plus object-store metadata/revisions and media references; privileged restoration in **isolated staging** and verify no draft becomes public. Set RPO/RTO after hosting/budget selection. Key rotation and restore procedures must avoid accidentally reactivating revoked sessions/challenges. Never store full backup as publicly downloadable CI artifact.

## Vulnerability and release process
Before launch require threat-model review, ASVS control applicability assessment, dependency/secret scans, authorization/CSRF/XSS/SSR negative tests, isolated restore drill, secure cookie/TLS/browser testing, pen-test/scoped manual review commensurate with risk, incident owner assignment and remediation of critical findings. A design document or static linter output is not a security approval.
