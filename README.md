# DEVFOLIO OS

Executable Phase 04.0 JavaScript foundation for the portfolio platform. **Not a production launch or final content/security/API contract.** Prior Phase 00–03 architecture and design handoffs remain intact.

## Local setup (Node 22 + Docker Compose)

```sh
git checkout feat/phase04-0-foundation
cp .env.example .env
docker compose up -d postgres
npm ci
npm run dev
```

The development command reads the optional ignored `.env` using Node 22. Browse `http://127.0.0.1:3000/`. Liveness: `/healthz`. Readiness: `/readyz` returns HTTP 503 if the database is not configured or reachable. Example PostgreSQL credentials are **local development only**.

```sh
npm run check:syntax
npm run lint
npm test
npm run check:secrets
npm run build
npm run start
# Production-style smoke (requires running DB and server)
node scripts/smoke.mjs
```

The tracked `package-lock.json` enables `npm ci`; CI additionally checks a real SSR production build, HTTP 404 and health/ready response, local PostgreSQL, and high-severity runtime dependency advisories.

See [Phase 04.0 handoff](docs/phase04/04.0_FOUNDATION.md) and [decision/verification record](docs/phase04/04.0_DECISIONS_AND_EVIDENCE.md). Owner approval of the authoritative SRS, MFA strategy, final database schema and final HTTP/API specifications remains **pending**. This branch intentionally has no application migrations or owner authentication.
