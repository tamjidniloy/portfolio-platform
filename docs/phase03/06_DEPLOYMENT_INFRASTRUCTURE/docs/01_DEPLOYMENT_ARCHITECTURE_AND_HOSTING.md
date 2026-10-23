# 03.6.1 — Hosting and deployment boundaries

Visitor/crawler + owner browser → HTTPS/DNS edge → Node/Express custom host + React Router SSR. Public SSR uses the published-only query facade and allowlisted DTO projection; admin CMS uses authenticated owner-only service and CSRF protections. PostgreSQL provides source of truth for revisions, published snapshots, sessions, contact, audit and outbox. A worker drains committed outbox events after SQL transactions; media is staged privately and delivered publicly only with authorized published references; mail is provider-integrated; backup vault and monitoring operate under distinct credentials.

Candidate hosting models:
1. **Managed Node/PaaS** with managed PostgreSQL — recommended first evaluation; easy patching/releases but confirm custom Express SSR, long-running or separate worker, egress, rollout and region.
2. **Managed containers** — explicit release images and worker split; extra orchestration/cost.
3. **VPS + containers** — OS-level control and possible price advantage, but full patching/firewall/TLS/backup/on-call burden.
4. Kubernetes or multi-region active-active **not proposed for Release 1**.

Environment diagram under `diagrams/01_DEPLOYMENT_TOPOLOGY.*` illustrates network boundaries, not running infrastructure. Database private endpoint only, TLS, source-specific least-privilege service identities, separate migration and backup roles. No public DB or unfiltered private repository read. SSR worker ingress has limited health endpoint and graceful shutdown. CDN may safely cache immutable public assets, but draft/revoked assets and protected routes MUST bypass shared caching. Conservative default: no shared caching of publish-sensitive HTML until immediate unpublish revocation has been end-to-end tested. A production image must not contain secrets or user PII.

**Hosting selection evidence:** proof that selected runtime supports React Router version and Express SSR integration, worker scheduling/queues, managed network DB security, monitoring, TLS, rollback, backup restore, cost with egress and actual support contract. No provider chosen here.
