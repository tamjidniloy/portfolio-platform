# 03.4.1 — Interface Boundary & Hosting Architecture

**Decision state:** PROPOSED; source SRS v1.1 unapproved. This document approves nothing by itself.

## Single-origin BFF and SSR-first design
Public pages are React Router Framework Mode server render/loaders, server-only domain application ports supply published DTOs. Owner dashboard is the same origin and uses server-side loaders/actions. A small set of **candidate resource routes** exposes JSON only when a resource/client needs that representation; do not implement a parallel broad public JSON API just because the catalog describes one.

### Flow / ownership
- Browser → HTTPS edge → Express/React Router request context → loader/action/resource handler → application use case → access policy + ports → PostgreSQL/data adapters.
- Public ReadFacade reads ONLY verified published snapshots and allowlisted DTOs; no public access to draft repository or media storage keys.
- OwnerCommandFacade requires active owner session and object authority, CSRF for state changes and revision guards.
- Adapter implementation (Postgres, storage, email, cache, outbox) is never imported by route modules or domain model.
- Route action is transport wiring, not validation/auth/business-rule authority. Validation occurs at boundary AND inside application domain invariant checks.
- Login form and contact intake use resource actions or SSR actions. Browser `fetch()` to a resource route does not automatically revalidate UI loaders: explicit revalidation plan is required for side effects.

## The two contract layers
**Internal ports** in 03.2 are JavaScript interfaces, not wire protocol promises. **HTTP candidate contracts** in this pack are OpenAPI resource-route possibilities. Loader data uses the same safe DTO policy but is not assumed to be a stable external `/api` endpoint. Both layers map to 03.3 candidate repositories; HTTP responses must never expose table rows directly.

## Header/session policy
- Same-origin owner cookie (illustrative `__Host-devfolio_session`), Secure+HttpOnly+SameSite; actual TTL, SameSite choice, CSRF token transport, idle extension and email-challenge policy are ADR work, not final requirements.
- Strict Origin checks and CSRF token for owner state-changing actions. Authentication endpoints need anti-cross-site abuse and session fixation checks; do not assume unprotected auth POST is safe.
- `X-Request-Id` is a non-sensitive correlation identifier. Log safe metadata, not passwords, contact bodies, OTP or signed upload URLs.
- If exposing `/api/v1`, return documented API version and inventory; any future external clients require explicit decision and threat review.

## Security boundaries
Threats include OWASP API1 broken object authorization, API2 broken authentication, API3 property-level exposure, API4 resource exhaustion, API5 function authorization and API7 SSRF. Public content projection, admin policy, allowlisted DTO, bounded page limits and remote URL restrictions address these by design; only later tests can validate mitigations.

## Not yet chosen
OAuth/passkeys, third-party public API access, ORM, hosted object storage/CDN, transactional email provider, exact cookie names, reverse proxy, headers/CSP values, pagination key strategy, rate limit numbers and public asset URL policy. All should be documented as ADR choices with evidence.
