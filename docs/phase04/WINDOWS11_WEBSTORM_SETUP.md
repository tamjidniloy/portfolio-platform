# Windows 11 setup — DEVFOLIO OS

**Workflow:** WebStorm for all Git commits/branches/pushes; npm for project tooling; native PostgreSQL 16 + pgAdmin; Postman for API checks. No containers.

## 1. Install prerequisites
- Git for Windows, Node.js 22 (select the Node 22 interpreter in WebStorm), WebStorm, Postman.
- Install PostgreSQL 16 for Windows from https://www.postgresql.org/download/windows/ using the interactive installer. Include pgAdmin and command-line tools. Choose a private `postgres` administrator password, remember it and keep the default 5432 port unless taken.
- Open PowerShell: `git --version`, `node --version`, `npm --version`, `& "C:\Program Files\PostgreSQL\16\bin\psql.exe" --version`. Adapt PostgreSQL path if installed elsewhere.

## 2. Set up two empty databases
Open pgAdmin, connect to localhost PostgreSQL as administrator `postgres`, select default `postgres` database, open Tools → Query Tool. **Run separately**, replacing the password with your own strong private value:

```sql
CREATE ROLE devfolio_dev LOGIN PASSWORD 'REPLACE_WITH_YOUR_PRIVATE_PASSWORD';
```

```sql
CREATE DATABASE devfolio_dev OWNER devfolio_dev;
```

```sql
CREATE DATABASE devfolio_test OWNER devfolio_dev;
```

This is a non-superuser application role. Application tables and migrations are **not** authorized until the SRS, schema and API contract approvals. Do not reuse the local password in production.

## 3. Clone and configure WebStorm
WebStorm → Get from VCS → GitHub → clone `https://github.com/tamjidniloy/portfolio-platform.git`. Choose Node 22. Use WebStorm Git pane to switch to development branch `feat/phase04-windows-native-development`. In its PowerShell terminal:

```powershell
Copy-Item .env.example .env
npm ci
```

Edit ignored `.env` with private credentials: `DATABASE_URL=postgresql://devfolio_dev:URL_ENCODED_PASSWORD@127.0.0.1:5432/devfolio_dev`. URL-encode reserved password characters (e.g. `@` → `%40`). Never commit `.env` or send screenshots of its contents.

## 4. Verify PostgreSQL independently
```powershell
& "C:\Program Files\PostgreSQL\16\bin\pg_isready.exe" -h 127.0.0.1 -p 5432
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -h 127.0.0.1 -U devfolio_dev -d devfolio_dev -c "SELECT current_database(), current_user;"
```

If pg_isready fails, open Windows Services (`services.msc`) and start `postgresql-x64-16`. For password failures check port, username, DB and password. Avoid sharing secrets in logs.

## 5. Verify SSR app
```powershell
npm run check
npm run dev
```

Open `http://127.0.0.1:3000/`; Postman GET `http://127.0.0.1:3000/healthz` should be 200, `/readyz` should be 200 with native database or safe 503 without. Stop dev server before testing `npm run build` followed by `npm run start`. Unexpected routes must produce HTTP 404. Empty portfolio collections are intentional until owner-approved content is published.

## 6. Postman
Import `postman/DEVFOLIO_OS_Foundation.postman_collection.json` and `postman/Local.postman_environment.json`, select Local and send collection requests. Only implemented endpoints should pass; draft Phase 03 OpenAPI paths are **not** automatically live.

## 7. Git and future production
Create feature branches, edit/test/review diffs, commit, push and create PRs inside WebStorm. Commit lockfile alongside changes in `package.json`; do not commit `node_modules`, build outputs, DB data, secrets or local IDE files. Staging, backups, hosting, and security signoff are separate later milestones.

## Common issues
- `psql` not on PATH: use full Windows executable path above.
- `readyz` is 503: database service/role/.env configuration is wrong; not necessarily a code bug.
- `npm ci` fails: verify Node version and internet access for registry.
- Port 3000 busy: stop previous process or change PORT and Postman baseUrl.
- Work/Research shows no items: correct prelaunch published-only behavior, never fabricate projects.
