# RB-01 — Controlled release and rollback
**Trigger:** scheduled release or regression after rollout. **Owner:** Release operator (assign before production). **Status:** planned, NOT_DRILLED.
1. Verify CI provenance, branch owner review, current immutable digest, staging tests, backup/restore readiness, migration compatibility and authorized production approval.
2. Announce release window and suspend conflicting deployments; snapshot/record schema and release SHA.
3. Apply additive/prechecked migration under separate principal, deploy exact staged artifact digest, run synthetic health/auth denial/public-data-only probes.
4. Compare p95/errors/outbox/DB saturation; on regression halt rollout. Roll back only if backward-compatible with DB. Never simply revert destructive migrations.
5. Reverify anonymous draft denial and revoked published URLs; record duration, evidence, decision and aftercare.
