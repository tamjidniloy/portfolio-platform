# RB-05 — Unpublished media leak / CDN invalidation
**Trigger:** public access to draft image, withdrawn case study, stale cached private pages. **Status:** planned, NOT_DRILLED.
1. SEV-1 privacy event: block route/URL at edge and application, revoke object tokens, identify asset association scope.
2. Stop insecure cache rollout; purge CDN/key or rotate opaque URL; enforce authoritative published-only access at origin.
3. Inspect logs and metadata without redistributing private media; notify owner, preserve forensic evidence.
4. Verify anonymous GET/HEAD and SSR/API/sitemap negative tests, signed URL expiry and revocation before re-opening.
5. Record exposure duration, prevention design and tests; never treat merely scheduling a purge as verified removal.
