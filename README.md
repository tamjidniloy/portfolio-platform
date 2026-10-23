# DEVFOLIO OS

JavaScript React Router Framework Mode SSR + Express + PostgreSQL. Professional **single-deployable modular monolith**, dark-first visual baseline. **Prelaunch development, not a production portfolio.** Phase 00–03 architecture documents remain intact.

## Windows 11 / WebStorm / npm / PostgreSQL / Postman

Install Node 22, Git for Windows, WebStorm, native PostgreSQL 16 and pgAdmin, and Postman. No Docker is needed locally or in CI. For the complete beginner-friendly walkthrough see [Windows setup](docs/phase04/WINDOWS11_WEBSTORM_SETUP.md).

Clone GitHub `tamjidniloy/portfolio-platform` inside WebStorm and switch to `feat/phase04-windows-native-development` to review this unmerged work. In WebStorm PowerShell:

```powershell
Copy-Item .env.example .env
# Edit the .env database URL; keep your private password out of Git.
npm ci
npm run check
npm run dev
```

Open http://127.0.0.1:3000/; import checked-in [Postman collection](postman/DEVFOLIO_OS_Foundation.postman_collection.json). `GET /healthz` shows process liveness; `GET /readyz` returns 200 with native PostgreSQL or 503 without it.

**Never run proposed schema DDL or implement sign-in/MFA as final contracts before explicit owner approvals.** Read [the owner gates](docs/phase04/PHASE04_IMPLEMENTATION_GATES.md), [updated architecture](docs/phase04/PHASE04_REVISED_ARCHITECTURE.md), and [Phase 03 master handoff](docs/phase03/PHASE03_MASTER_HANDOFF/PHASE03_MASTER_ARCHITECTURE_AND_HANDOFF.md).

Verification scripts: `npm run check:syntax`, `npm run lint`, `npm test`, `npm run check:no-docker`, `npm run check:secrets`, `npm run build`. Use `npm ci` for reproducible dependency installs.
