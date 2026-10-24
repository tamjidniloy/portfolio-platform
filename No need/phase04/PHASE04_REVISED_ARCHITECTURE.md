# Phase 04 — professional implementation baseline

**Single-origin modular monolith**: React Router Framework Mode SSR, one Express Node process, PostgreSQL read/persistence adapters, framework-independent domain rules, future owner-only CMS. JavaScript ESM and npm with committed `package-lock.json`.

```text
app/                  React Router routes, accessible public components
app/features/         Feature-facing presentation adapters
domain/               Framework-agnostic invariants and safe DTO projection
server/               Express, native PostgreSQL connection, health/ready probes
postman/              Secret-free development request suites
scripts/              npm and environment verification
tests/                Unit and HTTP negative checks
docs/phase04/          Windows setup, approvals, QA evidence
```

**Module rule**: delivery → application → domain+ports. Infrastructure adapters implement ports. Public serializers **allowlist** fields, never spread raw rows, never access drafts. Research scientific status is separate from CMS publication status. Admin/private data never publicly rendered or cached; preview requires real server authentication and `no-store/noindex`.

**Platform rule**: Windows 11 + WebStorm + Git UI + Postman + native PostgreSQL 16, **no Docker**. CI installs native PostgreSQL 16 on Ubuntu. Production provider/region/budget are unapproved; no release promises.

**Approved visual direction:** dark-first editorial/engineering case studies; use Phase 02 approved semantic colors and accessible focus patterns. Public brand and exact font remain open.

**Build sequence (62 original tasks)**: 04.0 P4-001–008 environment & scaffold; 04.1 P4-009–016 migrations & persistence (after approved schema); 04.2 P4-017–025 owner identity (after MFA decision); 04.3 P4-026–035 CMS & publication; 04.4 P4-036–044 media/contact/SEO; 04.5 P4-045–053 provider/staging/ops; 04.6 P4-054–062 complete executed QA and explicit go/no-go.

**Hard gates:** canonical SRS v1.1, MFA, final DB/API contract, privacy, hosting and recovery choice, and owner acceptance are pending. The instruction to build does not itself approve them. Avoid creating unreviewed migrations or sign-in, and do not claim production readiness from SSR smoke checks alone.
