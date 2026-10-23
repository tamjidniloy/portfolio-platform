# DEVFOLIO OS

Development baseline for the portfolio-platform monorepo. **Phase 04.0 is a development milestone, not a production launch.** Prior Phase 00–03 docs remain intact.

## Start locally

Requires Node 22, npm and Docker with Compose for PostgreSQL.

```sh
cp .env.example .env
docker compose up -d postgres
npm install
npm run dev
```

Browse `http://127.0.0.1:3000/`. Probes: `/healthz` (liveness) and `/readyz` (DB readiness). Note: Node does not read `.env` implicitly. Use `node --env-file=.env server.js` for development, or export `DATABASE_URL` and other values in your terminal. Without the database URL, readiness correctly returns 503.

```sh
npm run check:syntax
npm run lint
npm test
npm run check:secrets
npm run build
npm run start
```

See [Phase 04.0 foundation](docs/phase04/04.0_FOUNDATION.md) and [open owner decisions](docs/phase04/04.0_DECISIONS_AND_EVIDENCE.md). No database schema, MFA implementation, CMS or API contract is approved yet.

**Supply chain:** Versions in `package.json` are pinned at the direct level; the lockfile and `npm ci` conversion are still required before Phase 04.0 acceptance.
