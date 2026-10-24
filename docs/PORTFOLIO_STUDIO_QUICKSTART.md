# Portfolio Studio — simple local setup (Windows / WebStorm)

This is the **new**, no-code portfolio interface. It lives alongside the older Phase 04 CMS contract code but does not need its passkeys, JSON editors, owner provisioning tokens, CMS_API_ENABLED, or AWS S3 just to edit the portfolio locally.

## 1. Update project

In WebStorm on your local project (after the redesign PR is merged to main), open a terminal:

    git pull origin main
    npm ci

Keep your existing working DATABASE_URL in .env pointing to your local PostgreSQL database devfolio_dev (or your chosen local portfolio database). The new studio creates **only its own isolated portfolio_studio_* tables** on first run. It does not alter the historical db/migrations/* tables. PostgreSQL needs permission to create tables in that development database.

## 2. Set up the secret in your private .env

Add:

    PORTFOLIO_PUBLIC_ORIGIN=http://127.0.0.1:3000
    PORTFOLIO_AUTH_SECRET=PASTE_A_FRESH_64_CHARACTER_RANDOM_HEX_VALUE_HERE

Generate the actual 64-character secret in PowerShell with:

    node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"

Copy the output into .env. Never share or commit it.

**For local-only testing**, add PORTFOLIO_DEV_PRINT_OTP=true. The six-digit login code will appear in the npm run dev terminal after you enter the correct email and password. This does **not** send an email: it is an explicit development-only convenience. Do not enable this in deployment.

**For real email verification**, configure both settings instead:

    RESEND_API_KEY=your_private_resend_api_key
    PORTFOLIO_FROM_EMAIL=Portfolio <login@your-verified-domain.com>

Use a verified sender in Resend. The code is sent to the owner email you choose at setup. No visitor can create an account, and the public Login button is visible to everyone.

## 3. Create your one owner account (only once)

Run:

    npm run portfolio:setup

Enter your private email address and a strong password (at least 12 characters). The password input is hidden in the interactive terminal and stored as a salted scrypt hash in PostgreSQL, not as plaintext in .env.

This setup intentionally refuses to create a second owner. To reset your password, use a controlled database administrator procedure, not public signup. Back up your database and password securely.

## 4. Start the portfolio

    npm run dev

Open http://127.0.0.1:3000/ (the public landing page). Click **Login** in the top-right. Enter your owner email and password, then the six-digit code. If using local terminal mode, look for the DEV ONLY portfolio sign-in code line in WebStorm.

On successful verification, you enter /admin.

## 5. Edit and publish without code

Choose **Hero & about**, **Projects**, **Skills & tools**, **Experience**, **Education**, **Services**, **Social links**, **Contact**, or **Appearance** in the sidebar. Enter text, add rows, and upload JPG, PNG, or WebP pictures up to 5 MB.

Click **Publish updates** at the top or bottom of any section. The saved changes become the visitor-facing homepage content immediately on reload. Draft form edits remain in your browser until you save them.

Images are stored in data/uploads/ by default; the repository ignores that directory. **Back up this directory alongside PostgreSQL**, and use persistent disk storage if you deploy. Ephemeral hosts that delete local files are not supported for image persistence by this simple setup.

## Security notes

- Owner access requires correct password **and** a time-limited six-digit code.
- Codes are single-use, expire in 10 minutes and allow at most five tries; attempts are rate-limited in PostgreSQL.
- Sessions use HttpOnly, SameSite=Strict cookies, exact Origin checks and idle expiry. HTTPS and Secure cookies are mandatory for real production deployment.
- Email PIN verification is more convenient than passkeys but less phishing-resistant. Keep your owner email secure and use MFA on your mailbox.
- There is no visitor sign-up, public admin data API or third-party tracking built into this studio.
- This implementation is designed first for your Windows local PostgreSQL workflow. Production hosting, email provider, backup restoration, accessibility/browser and security audits still require real-environment verification.
