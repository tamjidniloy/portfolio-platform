# RB-02 — Database incident and isolated restoration
**Trigger:** failed DB readiness, data corruption, lost primary or stuck WAL archive. **Status:** planned, NOT_DRILLED.
1. Declare severity and freeze schema changes; protect backups, logs, WAL chain and currently served content privacy.
2. Check provider incident and connectivity, grants, pool pressure; avoid repeated write retries that duplicate publication commands.
3. Select latest complete validated backup+WAL/media metadata; choose restore timestamp and calculate prospective loss. Obtain explicit owner decision before destructive action.
4. Restore into isolated network/storage first; block outbound email; run integrity, sessions and public-only probes, then plan controlled cutover.
5. If restored point precedes privacy deletion, reapply deletion and revoke sessions; reconcile outbox idempotency and media objects.
6. Record actual RTO/RPO and failures. Escalate if objectives cannot be met.
