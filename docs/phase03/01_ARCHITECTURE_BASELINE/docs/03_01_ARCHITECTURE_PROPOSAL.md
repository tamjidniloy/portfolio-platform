# Phase 03.1 — Candidate Architecture Baseline

**State:** PROPOSED FOR OWNER / ENGINEERING REVIEW, NOT APPROVED  
**Date:** 2026-10-23; derived from SRS v1.1 CANDIDATE, approved Phase 02 design ADR scopes, and Phase 03.0 planning.  
**Decision scope:** system boundaries, modularity, SSR hosting model and security responsibilities. **Not** a finalized DB model, OpenAPI schema or dependency pin list.

## Recommendation
**Single-origin modular monolith**: a React Router Framework Mode **SSR application** mounted on a separately owned Node/Express server, with domain services behind route loaders/actions and a PostgreSQL persistence boundary. This is a **candidate default**, not yet an accepted ADR. One runtime may implement both public pages and protected admin while enforcing strict server-side publication/auth policy. Use the official `@react-router/express` adapter when a custom server is needed; do not add an independent parallel Express REST API until external clients or isolated services actually need it.

### Why this is suitable
- Public-first search indexing requires HTML populated on the initial SSR response; SPA-only shell is not the intended architecture.
- Owner CMS has a modest single-admin use case. Separate microservices would complicate transactions, authorization, deployment and costs without demonstrated benefit.
- Server-owned route actions and service modules allow publishing workflows without redeploying code.
- PostgreSQL supports transactional publication, revisions and FK integrity.
- The principal risk is **draft-to-public leakage**. Architecture MUST isolate public view models from mutable authoring data and explicitly test publication transitions.

## C4 Level 1 — actors and integrations
Users: **anonymous visitor / crawler**, **sole owner/admin**, **operator** (could be same person). External systems: object/media storage, email provider, DNS/TLS edge, error observability and backup infrastructure. No visitors authenticate. Public and admin arrive through the same origin with different authorization behavior.

## C4 Level 2 — containers (candidate)
| Container | Responsibility | Where it runs | Trust boundary |
|---|---|---|---|
| Browser | Public navigation + authenticated owner UI | Untrusted client | Never receives secrets/draft data anonymously |
| HTTPS ingress | TLS, request limits, redirects, security headers | Edge/reverse proxy | External -> app |
| Express/Node SSR host | Request ingress, adapter, request IDs, rate limits, headers and health | App process | Public/admin request entry |
| React Router route modules | Public loaders, admin loaders/actions and SSR components | Server/client split | Route guards are mandatory, not enough alone |
| Domain services | Published read service, authoring, revisions, auth, media, contact and SEO | Server only | All business authorization + validation |
| PostgreSQL | Content, publish projection, redirects, sessions, audit, inbox | Private network | DB access only server-side |
| Object storage | Private staging and public-approved media delivery | Managed provider | Controlled object visibility |
| Transactional mail | Challenge/recovery/contact notifications | Managed provider | No API keys in browser |
| Telemetry/backup | Redacted logs, alerts, database restore | Ops-only | Least-privilege access |

### Data flow, separation of concerns
- Public SSR: `route.loader → publishedReadService → publicContentProjection → PostgreSQL` → safe HTML + metadata. **Never** call authoring CRUD or return unpublished fields.
- Admin SSR: `requireOwnerSession → domainService → DB` → protected HTML/data with `Cache-Control: private, no-store`; additionally `noindex` for all admin/preview routes.
- Mutation: `admin.action → CSRF + authorization → server validation → service transaction → audit/outbox → confirmed result`. Do not show "Published" until commit and required projections succeed.
- Contact: public rate-limited submission → validate/anti-abuse → single stored message → optional email notification in separate resilient step. User wording must distinguish **message stored** from **notification delivered**.
- Upload: owner-auth → validate declared and sniffed type/size/name → quarantine/private storage → verified metadata → publish-safe attachment; URL alone never confers permission for draft media.

## Suggested code/module map (NOT implemented)
```text
server/
  index.js                 # Express bootstrap, adapter, HTTP policy
app/
  routes/                  # React Router loader/action/UI route modules
  components/              # Approved dark-first, accessible primitives
  .server/
    auth/                  # challenge/session/recovery policies
    content/               # draft, revision, published read model
    publishing/            # transactional publish/unpublish, redirects
    research/              # scientific stage / publication truth
    media/                 # asset ACL and metadata
    contact/               # intake + notification
    seo/                   # canonical/sitemap published-only
    database/              # repository + transaction adapters
    audit/                 # safe events and log redaction
  styles/                  # semantic tokens
infra/                     # deployment docs and IaC after provider ADR
scripts/                   # migration, test and safe operations
```
Do not rely only on naming `.server` folders for secrecy; configure server bundle boundaries and test browser output and public URLs.

## Architecture quality attributes
| Attribute | Proposed control | Verification later |
|---|---|---|
| SSR/search | Initial HTTP HTML contains real published content, canonical metadata | Raw HTML, crawler + sitemap tests |
| Confidentiality | Central published-only projection; auth on every protected route/action | Negative draft-leak and forced-browse tests |
| Integrity | DB transactions, FK/unique constraints, revision preconditions | Concurrent publish/restore tests |
| Accessibility | Semantic UI, keyboard/focus/error/reduced-motion design, 320px reflow target | WCAG 2.2 AA manual/automation in real browser |
| Performance | Correct indexing; static assets long-lived; HTML publication-aware | LCP/INP/CLS field data and synthetic tests |
| Operability | readiness/liveness, redacted structured logs, migrations, backups | Restore drill and failure injection |
| Recoverability | Independently restorable DB and referenced objects | Restore test with representative content/media |

## Rejected-at-this-stage alternatives (not a final prohibition)
1. **SPA-only public rendering:** fails the stated SSR-first content/crawler intent; revisit only for nonessential interactive widgets.
2. **Microservices / separate CMS backend:** premature complexity for one owner and shared transactional content model.
3. **Public endpoints that read mutable draft tables directly:** very high risk of accidental draft exposure; prefer explicit published projection/service.
4. **Client-only auth checks:** insecure; server route, service and storage authorization required.
5. **Permanent public URLs for unverified staged uploads:** potential draft/content privacy violation.

## Explicit unresolved decisions
- ORM and migration tool (Prisma, Drizzle or SQL-first); model field limits.
- Publication storage: immutable version/snapshot vs explicit status flag + revision joins.
- Email/storage/hosting vendors, region, budget, CDN and backup provider.
- Cookie session storage/expiry, OTP rate caps, media limits, retention intervals and error SLA.
- Need for `/api/v1/*` public API vs route loaders/actions only; defer OpenAPI binding until owner SRS approval.
- Native Penpot connected screens and design QA evidence remain missing.

## References (primary)
React Router Framework Mode: https://reactrouter.com/start/modes  
Official Express adapter: https://reactrouter.com/api/other-api/adapter  
Sessions and cookies: https://reactrouter.com/explanation/sessions-and-cookies  
OWASP ASVS 5.0.0 (stable): https://asvs.owasp.org/
