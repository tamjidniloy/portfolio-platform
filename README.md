# DEVFOLIO OS — Portfolio Studio

A personal portfolio with a private, no-code owner dashboard. Built as a **server-rendered modular monolith** with React Router, Express, Node.js 22 and PostgreSQL 16.

## Run on Windows / WebStorm

1. Install Node.js 22+ and PostgreSQL 16.
2. Run `npm ci`.
3. Copy `.env.example` to your **untracked** `.env`. Set `DATABASE_URL`, `PORTFOLIO_PUBLIC_ORIGIN=http://127.0.0.1:3000` and a random `PORTFOLIO_AUTH_SECRET` (at least 32 bytes).
4. For local OTP testing only, set `PORTFOLIO_DEV_PRINT_OTP=true`. For deployed email, configure Resend using a verified sender instead.
5. Run `npm run portfolio:setup` **once**, choosing your real admin email and a password of at least 12 characters.
6. Run `npm run dev`, visit http://127.0.0.1:3000/ and click **Login**.
7. Edit content in `/admin` and select **Publish updates**.

Generate a secret using `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Never commit or share it.

To change your password, run `npm run portfolio:change-password` and follow the hidden terminal prompts. It requires your current password and revokes active sessions.

## Architecture

```text
app/
  routes/home.jsx             Public SSR portfolio
  routes/admin-login.jsx      Owner email/password + OTP interface
  routes/admin.jsx            Accessible, structured owner editor
  components/public-shell.jsx Shared public navigation and layout
  styles.css                  Existing visual editor styling\n  experience.css              Public design tokens, animation and responsive layouts\n  components/theme-control.jsx Persistent accessible light/dark UI toggle
server/
  studio/
    index.js                  Stable server-side API boundary
    content.js                Portfolio data contract and validation
    db.js                     PostgreSQL pool, schema, content persistence
    auth.js                   Password, OTP, rate limits and sessions
    http.js                   Express routes, authorization, HTTP errors
    media.js                  Validated local image upload and serving\n    contact.js                Validated rate-limited optional email contact form
    errors.js                 Typed domain errors
  config.js                   Environment parsing
  database.js                 DB readiness
  probes.js                   /healthz and /readyz
  observability.js            Redacted structured request logs
  network/trusted-proxy.js     Explicit limited reverse-proxy trust
scripts/
  dev-supervisor.mjs          Windows-friendly development process lifecycle
  portfolio-setup.mjs         Initial single-owner registration
  portfolio-change-password.mjs
  smoke.mjs                   Anonymous HTTP checks
  studio-auth-smoke.mjs       PostgreSQL-backed authentication flow checks
tests/
  portfolio-studio.test.js    Content/auth security regression tests
server.js                     HTTP bootstrap and SSR integration
```

**Stable interface:** route loaders import public Studio operations from `server/studio/index.js`. API handlers in `http.js` enforce authentication and same-origin mutations; `auth.js` owns identity and sessions; `db.js` alone owns Studio persistence. SQL is parameterized; the owner password is stored as a salted scrypt hash; session cookies are HttpOnly and SameSite=Strict, with Secure enabled in production.

The earlier Phase 04 CMS, WebAuthn prototype, historical schemas and deployment artifacts were retired from this source tree. **The only active content engine is Portfolio Studio.** Older /projects, /work and /contact URLs now redirect to their homepage sections. No legacy CMS records are imported or deleted from PostgreSQL.

## Verification

```powershell
npm run check      # syntax + ESLint + unit tests + SSR build
npm run dev        # development
npm run build      # production bundle
npm start          # production (after building; configure HTTPS/reverse proxy)
```

GitHub Actions checks npm installation, lint, unit tests, SSR build, public/anonymous requests and the **real OTP → server cookie → owner dashboard → logout** flow against an ephemeral PostgreSQL database.

## Operating and security notes

- **Do not delete or recreate PostgreSQL tables** when updating code. `portfolio_studio_*` contains live owner data.
- Keep `.env` private. Keep `data/uploads/` outside Git and back it up **along with** the PostgreSQL database.
- Current Studio initialization creates missing tables automatically. A reviewed versioned migration process and least-privilege database roles are still needed before a high-assurance deployment.
- Use HTTPS, a verified email sender, persistent upload storage, backup/restore drills, and real-browser security/accessibility testing before a public production launch. CI is necessary but not proof of production readiness.
- The old CMS database tables are left untouched in existing PostgreSQL databases; removal of old source files does not drop tables.

## API surface

| Endpoint | Access | Purpose |
| --- | --- | --- |
| `GET /api/studio/public` | Public | Published portfolio |
| `GET /api/studio/session` | Public, cookie-aware | Owner session status |
| `POST /api/studio/login/start` | Same-origin | Password check; start OTP |
| `POST /api/studio/login/verify` | Same-origin | Consume OTP; set cookie |
| `POST /api/studio/logout` | Owner | Revoke session |
| `PUT /api/studio/content` | Owner | Validate and publish content |
| `POST /api/studio/upload` | Owner | JPG/PNG/WebP upload ≤ 5 MB |
| `GET /media/:name` | Public | Uploaded portfolio images |\n| `POST /api/studio/contact` | Public, same-origin | Validated owner email enquiry when delivery enabled |

No public signup or password reset endpoint exists.

## Frontend experience

- Deliberate editorial typography and hierarchy with a CSS-only hero sculpture and subtle motion.
- Light/dark themes, remembered per browser; respects reduced-motion preferences.
- Responsive layouts and accessible touch-sized navigation from 320px phones through wide monitors.
- Category filters for published projects, actual experience and skill counts (no fabricated testimonials or rankings).
- Direct `mailto:` and copy-email actions always remain available when a public contact email is set in Admin → Contact.
- A visitor enquiry form appears **only** when `RESEND_API_KEY` and `PORTFOLIO_FROM_EMAIL` are configured; it sends directly to the public contact email. It stores no message bodies in PostgreSQL. Run provider and inbox-delivery acceptance tests before deploying.

All appearance work is in existing React/CSS; no animation or UI dependency was added. All content remains editable in the existing no-code dashboard.
