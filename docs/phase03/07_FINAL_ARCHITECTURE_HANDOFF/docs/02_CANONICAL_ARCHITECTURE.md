# 03.7.2 — Candidate Canonical Architecture (Not Deployed)

## System structure
A modular-monolith Node application serves public **React Router Framework Mode SSR** and a private owner CMS through a proposed Express integration. Domain-oriented application services own security and business behavior; PostgreSQL is the proposed system of record, supported by controlled object storage, transactional email and an outbox worker. This is **not 26 microservices**, a deployed topology, or an approved physical schema.

## Logical layers
1. **Edge/browser:** TLS termination, routing, rate limiting and safe headers. Browsers never connect to DB/private storage.
2. **Delivery/SSR:** React Router loaders/actions or narrow resource routes. Thin transport validation; never bypass domain application services.
3. **Application:** public published-only read façade, authorized owner commands, expected-revision concurrency, contact/notifications, upload orchestration, audit and outbox Unit of Work.
4. **Domain:** identity/sessions; publishing/revisions; projects/research/publications/writing; profile/background; media; contact; settings and SEO. Domain cannot import Express, ORM, React or provider SDKs.
5. **Infrastructure:** data repositories implementing ports, DB transaction manager, storage/mail clients, outbox and cache/sitemap invalidation; least privilege and sanitized telemetry.
6. **Operations:** distinct dev/staging/prod, deployment identity, backups, restore, monitoring and incident management.

## Non-negotiable candidate invariants
- Public SSR/JSON/search/sitemap/media only access **published** canonical views and allowlisted DTO fields. An unpublished slug is a safe 404 (or a previously published redirect only when still valid).
- Private preview requires fresh verified owner session; never add preview to sitemap, store in a shared cache or expose via signed URL without independent authorization and bounded TTL.
- Every private read and mutation is server authorized; every cookie-backed mutation additionally obeys CSRF/Origin checks. Privileged events are auditable without secret/PII leakage.
- Save Draft and Publish validation are different; publish must commit a coherent revision, public snapshot and durable outbox event atomically. Report success only after an authoritative commit.
- Revisions use expected-version conditions; stale writes surface a conflict, not silent overwrite. Restoration creates a draft for review.
- Unpublish revokes anonymous visibility even when cache invalidation/email fails. Shared cache of sensitive details is disabled until revocation policy is proven.
- Scientific research **stage** and CMS public/private **publication state** are independent, and real claims/credentials must be verifiable.
- Contact storage is separate from provider notification success; media uploads stage privately and are validated/linked before public use.

## Component and storage counts are proposals
See Phase03.2 26 logical components/18 proposed ports; Phase03.3 18 candidate tables/17 relationships; Phase03.4 OpenAPI 29 resource operations and 41 SSR route candidates. These are planning counts, not actual deployable endpoints, migrations or locked requirements.

## Allowed implementation dependencies
`UI -> SSR/route -> application use case -> domain/port <- infrastructure implementation`. Forbidden: domain -> ORM/React/Express; public facade -> private revision repository; route -> raw table/SDK; browser -> private infrastructure. Enforce in CI after scaffolding.
