# DEVFOLIO OS — family preview (separate branch)

This is a **read-only** preview of the original React Router SSR portfolio, NOT the paid production deployment. The snapshot comes from the user's exported public portfolio JSON and its integrity-checked image.

The main branch and local PostgreSQL database remain unchanged. Public pages, transitions and project detail routes run through the original React Router app. `/admin` and every writing API are blocked by `preview-server.mjs`. The contact form has no delivery integration; because the exported public email is blank, it is unavailable on the preview.

## Local test before pushing

From the GitHub repository root **after switching to a new preview branch and overlaying these files**:

```powershell
npm ci
npm run build
node preview-server.mjs
```

Open http://127.0.0.1:10000 and check `/readyz`, `/projects/...`, the profile photo, and links. Ctrl+C to stop.

## Render manual Web Service (not Blueprint)

- **Git repository:** `tamjidniloy/portfolio-platform`
- **Branch:** `preview-family`
- **Root Directory:** leave blank
- **Runtime / Language:** Node
- **Build command:** `npm ci && npm run build`
- **Start command:** `node preview-server.mjs`
- **Instance type:** Free
- **Environment variable:** `NODE_VERSION=22.12.0` (optional if your Render default supports Node >=22.12)
- **Health check:** `/readyz`

Render provides `RENDER_EXTERNAL_URL` automatically, so canonical URLs use the deployed `onrender.com` address. No database, domain, Resend, environment secrets, migrations, or volume is needed. DO NOT create the root `render.yaml` Blueprint: it provisions paid resources intended for real production.

The snapshot and image in this preview branch are PUBLIC if you deploy; do not include passwords or private data. The preview URL is reachable by anyone with the link, and search crawlers are asked not to index it. This is not password-protected and robots exclusion is not an access control.

To update content, export again and replace `preview/content.json` and checked-in `preview/media/` assets on the preview branch. Changes in your local admin editor do not sync automatically.
