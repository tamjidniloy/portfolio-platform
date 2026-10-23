# 03.5.4 Authorization and Published-Only Data Isolation

## Default security decision
**Deny by default** at server middleware + application-use-case level. Public SSR/JSON may read only `published_snapshots` through a published query interface and explicit allowlisted DTO; never public-query draft tables or switch to preview due to a query string. The owner-only CMS may read drafts only under a valid active session and resource-specific policy. Treat UIDs/slugs as untrusted; object ownership and allowed transition states verified server-side.

## Authorization matrix
The authoritative candidate matrix in `matrices/ACCESS_CONTROL_MATRIX.csv` covers anonymous, pending challenge, verified owner, worker and migration actors for public routes, drafts, revision restore, media, contact inbox, audit, security settings and infrastructure tasks. There are no visitor accounts and no implied superuser UI.

## Publication boundary
Draft/revision/published states are distinct. Private preview is an authorized **read action**, not a durable public publication state. Publishing validates against the **expected revision** and atomically writes snapshot + audit + outbox. Success messages only after commit. Unpublish removes public eligibility atomically; do not serve stale private data from edge caches. Cache invalidation alone cannot enforce withdrawn-content privacy.

**Cross-channel leakage tests required:** HTML SSR, JSON loader data, REST/resource routes, XML sitemap, metadata/OG tags, search, RSS (if any), redirects, CDN cached HTML, asset URLs, public screenshots/media derivatives, rich editor preview, error telemetry and response timing/status. Draft/missing object responses must avoid existence oracles where possible.

## Policy checks and secure command contract
```text
actor = verified_session(request)                 # not client-provided ownerId
csrf_ok = verify_csrf_and_origin(request)          # for writes
entity = repo.load_private(id)                    # only in owner use case
policy.assert_can(actor, 'publish', entity)
revision = require_if_match_version(request)      # reject stale 428/412
validate_for_publication(entity, revision)
unit_of_work.commit(snapshot, revision, audit, outbox)
return server_confirmed_receipt()                 # not after optimistic UI only
```
No adapter, DTO mapper or React loader may bypass `policy.assert_can`/public projection. DB RLS, if adopted later, is supplemental defense only; not a replacement for request policy.

## Cross-service identity
Outbox workers use scoped service credentials and validated event types; they do not impersonate the owner via browser session cookies. The job service can process already-authorized durable intents but cannot publish unpublished drafts independently.
