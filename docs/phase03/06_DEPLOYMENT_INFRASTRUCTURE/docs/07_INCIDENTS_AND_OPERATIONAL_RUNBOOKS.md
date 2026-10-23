# 03.6.7 — Incident response, rollback and maintenance

## Operating model
One owner manages content but operational access is a separate trust boundary. Establish an owner on-call contact method, backup alternate access and provider support paths before launch; do not print personal contacts in repo. Logs/security evidence have privacy-restricted retention. Preserve incident timeline, environment, commit/image digest, request correlations, active protection state and remediation evidence.

## Severity classification
**SEV-1:** confirmed draft/PII leak, admin takeover, active unauthorized production change, DB loss or total prolonged outage. Stop release; contain first; revoke sessions/keys, block exposed paths, restore if necessary. **SEV-2:** major performance, auth or publishing downtime; evaluate rollback and dependency degradation. **SEV-3:** minor rendering or SEO defect with intact data safety.

## Common response cycle
1. Detect/confirm without copying secrets or visitor contact content into tickets.
2. Classify severity and identify decision maker; start timestamped incident log.
3. Contain: disable vulnerable route/deploy, revoke credentials/sessions, bypass/cut cache, isolate affected subsystem as needed.
4. Recover using known-good immutable release or verified backup; **app rollback may be unsafe after irreversible schema changes**.
5. Validate negative access to unpublished content, auth, integrity/backup point, staging smoke and public critical path.
6. Close only after owner review, evidence capture, cause analysis and prevention follow-up.

## Runbooks shipped
`RB-01_RELEASE_AND_ROLLBACK.md`, `RB-02_DATABASE_OUTAGE_AND_RESTORE.md`, `RB-03_AUTH_OR_SECRET_COMPROMISE.md`, `RB-04_EMAIL_AND_CONTACT_DEGRADATION.md`, `RB-05_MEDIA_OR_CDN_LEAK.md`, `RB-06_BACKUP_AND_RESTORE_DRILL.md`, `RB-07_SITE_OUTAGE_OR_TLS.md`.

Change and patch cadence: weekly dependency/security review candidate, monthly patch window candidate, immediate critical vulnerability handling based on exploitability and exposure. Record actual SLAs after owner approves risk and operating capacity.
