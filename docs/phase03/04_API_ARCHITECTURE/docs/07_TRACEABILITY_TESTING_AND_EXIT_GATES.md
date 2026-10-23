# 03.4.7 — Verification Strategy, Owner Gate and Phase 03.5 Handoff

## Evidence hierarchy
This phase provides a *static candidate contract*. JSON/YAML structural checks validate document consistency, not security, real HTTP behavior, browser accessibility or DB semantics. The 60 `API34-*` review checks in the matrix are **NOT_RUN**, even if a static packaging validator passes.

## Required later test layers
- Unit: DTO public-field allowlists, canonical slug normalization, private-resource classification, cursor and validation guards.
- Integration: no public draft visibility via raw SSR HTML, loaders, API, sitemap, XML, cache or media; revision preconditions; transaction rollback; policy denial; atomic outbox.
- Auth/security: OTP expiry/replay, rate-limit, password/session fixation, CSRF origin/token, missing object authority, HTTP method bypass, mass assignment, SSRF/file magic bytes.
- Browser E2E: owner login → save draft → preview → publish → unpublish; staged upload, failed contact mail delivery, session expiry.
- Accessibility: keyboard, focus, errors, 320px reflow, screen reader, reduced motion and WCAG 2.2 AA on running UI (not checked by OpenAPI validation).
- Load/ops: published read latency, bounded pagination, 429/503, deduplication under retry, monitor health, backup and isolated restore.

## Hard gates before freezing API/schema
1. Owner explicitly reviews and approves actual SRS v1.1 text or another authoritative approved version, with any changes documented.
2. Phase 03.3 candidate DB schema and related ADRs accepted/reconciled; no deployed migrations assumed.
3. Owner reviews 03.4 routing approach, public JSON API exposure, field shape, OTP/CSRF/session model, media/privacy, retention and exact error protocol.
4. Contract traces to all approved P0 FR/NFR and added acceptance tests reviewed, not merely 03.4 operations linked to some FRs.
5. The 60 review cases assigned/executed; real auth, browser, WCAG and penetration verification remain Phase 04+/release gates.

## Proposed Phase 03.5 work
**Authentication & security architecture**: formalize exact session/cookie/email challenge ADR, rate limits, CSRF rules, account recovery and API threat-model, perform design review; no implementation assumptions. Follow with 03.6 media/SEO/reliability/deployment and 03.7 architecture handoff.

## Owner review action
See `review/OWNER_REVIEW.md`. Phase 03.4 can be accepted at *design-specification level*, not as immutable wire contract nor a working API until requirements approval and integration tests.
