# DEVFOLIO OS — Portfolio Studio

A server-rendered personal portfolio with an owner-only, no-code publishing studio.

**Runtime:** Node.js 22, React 19, React Router 7 SSR, Express 5, PostgreSQL 16. No Docker or separate frontend hosting service required. This repository keeps the application and its production handoff in one place.

## Development (Windows / WebStorm)

1. Install Node.js 22+ and PostgreSQL 16.
2. `npm ci`
3. Copy `.env.example` to `.env` and fill in the local `DATABASE_URL`, `PORTFOLIO_PUBLIC_ORIGIN` and strong random `PORTFOLIO_AUTH_SECRET`.
4. Run `npm run portfolio:setup` once if you have not already registered an owner. **Do not run setup again for an existing owner.**
5. For local-only testing, `PORTFOLIO_DEV_PRINT_OTP=true` prints the six-digit sign-in code to your WebStorm server terminal.
6. `npm run dev` and open http://127.0.0.1:3000.

Your current local owner credentials, database, `.env`, and `data/uploads` stay exactly where they are. To change the owner password, use `npm run portfolio:change-password`.

## Quick command reference

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local server and hot reload |
| `npm run check` | Syntax, lint, unit tests and production build |
| `npm run db:migrate` | Apply safe versioned Studio V1 migration (idempotent) |
| `npm run db:status` | Verify schema and report number of owner/content records |
| `npm run prod:check` | Validate required production environment settings |
| `npm run portfolio:export` | Save published content + uploaded images as a portable bundle |
| `npm run portfolio:import -- <file> --confirm-empty-portfolio` | Import bundle once into an untouched starter portfolio |
| `npm run portfolio:setup` | Register initial owner once |
| `npm run portfolio:change-password` | Rotate password and revoke sessions |
| `npm run smoke:production -- https://your-domain.example` | Read-only public HTTPS acceptance checks |

## Phase 5 — Real hosting and domain deployment (Render example)

**This stage does not purchase a domain or deploy for you.** The exact values of your domain, verified sending address, database, and storage have to come from your real accounts. The committed `render.yaml` is a ready-to-review production blueprint (paid resources), not a claim that services already exist.

### Step A: Protect your local data first

- In WebStorm, verify `npm run check` and log in to your dashboard.
- Take a PostgreSQL backup in pgAdmin or using PostgreSQL's `pg_dump` (custom format). Back up `data/uploads` as well. **Both are needed for full recovery.**
- Run `npm run portfolio:export`. Note the generated file path under `data/exports/`. It contains *public* portfolio data and uploaded images, but deliberately **not** your account, password, OTPs or sessions.
- Keep your local `.env` private. Never copy it wholesale into production.

### Step B: Buy the right things

Buy a domain at a registrar of your choice. You do **not** need a separate shared-hosting package if you use Render for the application and managed PostgreSQL.

Budget for these paid Render resources from `render.yaml`:

- One single-instance Node web service (paid plan with a 5 GB mounted persistent disk for uploads).
- One paid managed PostgreSQL 16 database in the **same Singapore region**.
- A domain registration and a verified Resend sending domain/API key.

Review the actual pricing and resource sizes in the Render dashboard before approving payment. Disk-backed Render services have a short outage during redeploys and cannot run multiple instances; this is an intentional simplicity tradeoff for a personal site.

### Step C: Verify your email sending domain

1. Open Resend, add the domain or sending subdomain you own (for example, `mail.example.com`).
2. Add the SPF/DKIM and other DNS records **exactly as shown by Resend**, then wait until its domain shows **Verified**.
3. Create a Resend API key, store it privately.
4. Choose your verified sending identity, for example `Portfolio <login@mail.example.com>`. Your public contact recipient email can be a separate inbox and is configured later in the admin dashboard.
5. Keep `PORTFOLIO_DEV_PRINT_OTP` **unset** on Render. Actual OTP messages require email delivery.

### Step D: Create services using the GitHub blueprint

1. Ensure this Phase 5 branch was merged and your GitHub **main** CI is green.
2. In Render, connect the private GitHub repository and create a new **Blueprint** based on the root `render.yaml`.
3. Review the **paid** web/database/disk resources before accepting.
4. Supply the prompted secret/environment values:
   - `PORTFOLIO_PUBLIC_ORIGIN=https://example.com` — replace with **your own canonical final HTTPS domain**, without slash after the hostname.
   - `RESEND_API_KEY` — real private key from Resend.
   - `PORTFOLIO_FROM_EMAIL` — verified sender identity.
5. Render injects `DATABASE_URL` from managed PostgreSQL, generates a random `PORTFOLIO_AUTH_SECRET`, provisions persistent storage at `/var/data`, runs `npm ci && npm run build`, then `npm run db:migrate`, then `npm start`.
6. Check that `/healthz` and `/readyz` return healthy responses. The app deliberately refuses to start with missing production settings or unapplied migrations.

**Important:** While `PORTFOLIO_PUBLIC_ORIGIN` points to your future custom domain, OTP sign-in via the temporary `onrender.com` URL is intentionally blocked by the same-origin guard. Complete the domain setup first, then sign in using the canonical domain.

### Step E: Connect your purchased domain

1. In your Render web service, open **Settings → Custom Domains** and add the exact domain used in `PORTFOLIO_PUBLIC_ORIGIN`.
2. At your registrar/DNS provider, add the DNS records Render displays for this service (do not guess IP addresses or CNAME targets).
3. Return to Render and verify the domain. Render provisions and renews HTTPS certificates.
4. If you also add `www`, set one hostname as canonical and redirect the other; owner login must use the canonical hostname.
5. Wait for the certificate to be valid before testing authentication; HTTPS cookies are mandatory.

### Step F: Set up owner and published content

1. Open **Render web service → Shell** (paid plan), then run `npm run db:status`.
2. If the managed DB has no owner, run `npm run portfolio:setup` interactively and choose a **new strong production password** and your real email address. Do not copy your local owner password or owner table.
3. To transfer existing local projects/photos, move the export JSON from your Windows machine to the web service **persistent disk**, for example `/var/data/portfolio-export.json`. Render documents `magic-wormhole` as one supported way to transfer files to a service shell. Keep the transfer private.
4. With the file present on Render and **before editing the empty starter portfolio**, execute:
   `npm run portfolio:import -- /var/data/portfolio-export.json --confirm-empty-portfolio`
5. If the target was already edited, the import refuses to overwrite it. Preserve the existing database; contact a developer to review the content rather than deleting records to bypass the safeguard.
6. Go to `https://YOUR-DOMAIN/admin/login`. Enter your **production** owner email and password, then the real six-digit code delivered via Resend.
7. In Admin → Contact, publish your public email address; publish all final profile, project, skill and social information.
8. Test uploading a new image, editing content, publishing, refreshing and **restarting/redeploying** without losing the uploaded image.

The local database and the new production database remain separate; your local data will not be automatically synchronized.

### Step G: Run the live launch gate

On your own laptop after the domain is secured:

```powershell
git switch main
git pull origin main
npm ci
npm run check
npm run smoke:production -- https://example.com
```

Use your real domain, not `example.com`. Also test these manually: real OTP email, correct logout, owner updates, contact enquiry arrival, mobile/tablet/desktop sizes, light/dark theme persistence, correct resume and social links, keyboard navigation and reduced motion.

### Step H: Backups, monitoring and recovery

- Enable/verify **managed PostgreSQL backups**, point-in-time recovery and logical export according to your paid database plan. Practice restoring to a **separate disposable database**; never test a destructive restore on live data.
- Render persistent-disk snapshots are *not* a substitute for an independent copy of `/var/data/uploads`. Keep a second secure/offsite backup of images. Test that image paths match your exported content.
- Monitor `/readyz` (database **and** writable upload store), host deployment notifications and email-provider delivery errors.
- Run `npm run db:status` after any deployment. Only apply forward migrations after backups.
- If a release fails: roll back to the last healthy application deployment using Render's deployment controls, check the readiness endpoint, and **do not automatically reverse database migrations**. This Phase 5 V1 migration adds and indexes tables only; it does not erase owner content.
- Periodically check provider costs, domain renewal, email sending limits, disk use and backup retention.
- Render can deploy from GitHub only after checks pass as configured by `autoDeployTrigger: checksPass`. Also configure GitHub branch protection to require the Portfolio CI job.

## Architecture

```text
app/                       SSR frontend, accessible editorial UI and no-code editor
server.js                  HTTP composition root and security headers
server/config.js           Environment validation; production starts fail-closed
server/studio/content.js   Data contract and input validation
server/studio/auth.js      Salted password, single-use email OTP and sessions
server/studio/http.js      Authorized JSON/API routes
server/studio/contact.js   Optional validated contact delivery via Resend
server/studio/media.js     Validated local images and writable storage readiness
server/studio/db.js        PostgreSQL pool and typed content reads
server/studio/migrations.js V1 schema, advisory lock and expired-data pruning
scripts/                   Owner setup, transfers, migration, launch smoke tests
qa/ and tests/             Browser accessibility/security/UX and unit tests
render.yaml                Production Node/PG/disk/secret blueprint (paid)
.github/workflows/         CI including authentic OTP → admin browser flow
```

**Boundaries:** Owner information is never in the public API; authenticated cookies use HttpOnly, SameSite=Strict and Secure in production. The server refuses unexpected cross-origin write requests. Expired sessions, OTPs and attempt counters are pruned periodically. Published content uses a version check to prevent overwriting another editor session.

### Remaining real-world acceptance

The GitHub pipeline validates the code and a **disposable CI PostgreSQL database**, not your real DNS, Render account, external email inbox, production disk backups or live site. Those real-world tests above must succeed before Phase 5 can be signed off as an actual production launch. No hosting charge, domain purchase or deployment occurs from merging these files.

Official references: https://render.com/docs/blueprint-spec · https://render.com/docs/custom-domains · https://render.com/docs/disks · https://render.com/docs/postgresql-backups · https://render.com/docs/ssh · https://resend.com/docs
