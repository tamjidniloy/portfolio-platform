# RB-04 — Email outage and contact queue
**Trigger:** provider 429/5xx, bounced/delayed OTPs, outbox backlog. **Status:** planned, NOT_DRILLED.
1. Verify provider status and internal queue without logging message bodies or secrets.
2. Keep pending login unprivileged; no bypass of required authentication. Display accurate retry/failure messaging.
3. For contact, store only if DB commit succeeds; distinguish received message from unverified delivery.
4. Retry idempotently with bounded backoff/jitter, enforce provider quotas; alert for dead-letter count and prolonged backlog.
5. Reconcile duplicate delivery and document completion/remaining notices without false confirmations.
