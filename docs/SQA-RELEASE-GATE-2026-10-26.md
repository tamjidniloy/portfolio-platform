# DEVFOLIO OS — Pre-Deployment SQA Acceptance Report

**Date:** October 26, 2026  
**Project:** DEVFOLIO OS — Signature Edition  
**Environment:** GitHub Actions / Ubuntu 24.04 / Node 22.12 / PostgreSQL 16 / React Router SSR in production mode / headless Chrome / loopback  
**Evidence:** https://github.com/tamjidniloy/portfolio-platform/actions/runs/40247252793  
**SQA code review:** https://github.com/tamjidniloy/portfolio-platform/pull/64  
**Decision:** **Isolated engineering verification PASS. Production deployment acceptance NOT YET VERIFIED.**

## Scope and results

| Discipline | Actual verification | Result | Limitation |
| --- | --- | --- | --- |
| Build and code quality | Syntax, ESLint, clean production SSR build | PASS | Human source review recommended |
| Unit tests | CMS, auth, content, contact email, color contrast, journey | 24 passed, 0 failed | Test count is not coverage % |
| Database | PostgreSQL 16 migration twice, schema check, owner preservation, optimistic content update | PASS | Live managed database not tested |
| Authentication | Wrong password/OTP, expired OTP, correct OTP, session cookie, replay prevention, protected admin, logout | PASS | Actual inbox OTP delivery not tested |
| API security | Origin/CSRF, anonymous permission, body size, contact consent, media paths, response headers and private errors | PASS | Does not replace penetration testing |
| Contact delivery | Mocked Resend provider success, failure, timeout and payload contract | PASS | Live Resend and real recipient unverified |
| CMS/project | Real SSR content, Project X-Ray, transformation media, sitemap and privacy | PASS | Owner must review real published content |
| Backup and recovery | Separate PostgreSQL database + clean media directory, public content export/import and byte-for-byte before/after images | PASS | Full database/offsite restore not tested |
| Accessibility | WCAG 2.x A/AA automated axe audit, 6 routes, 2 themes, 2 viewports | **24 combinations, 0 violations** | Manual screen-reader and keyboard audit still needed |
| Responsive | Browser QA at 320, 390, 768, 1440 and 1920 px | PASS | Physical mobile and Safari/Firefox not tested |
| Reliability | 120 requests, 6 concurrent workers, 5 SSR/API routes | **120 successful, 0 errors** | Bounded smoke, not capacity certification |
| Performance | Headless Chrome FCP, LCP, CLS and TTFB telemetry | RECORDED | Unthrottled local lab, not field CWV |
| Dependencies | Production dependency audit at high severity | PASS | New vulnerabilities can emerge after audit |
| Operations | Health/readiness, log privacy, runbook scripts | PASS | Real alerting and rollback drills pending |

## Issues found and corrected

**SQA-001 — Medium — contact validation.** Leading/trailing newlines could be trimmed before being validated in contact identity and subject strings. Fixed by validating raw values before trimming; regression tests added.

**SQA-002 — Medium — accessibility.** Light-mode owner login body/help text had insufficient contrast. Updated text color; 24-case WCAG A/AA audit now reports no violations.

**SQA-003 — High — backup completeness.** Before/after transformation images were omitted from portable portfolio export. Added all referenced project images, raised the bounded image count to match the CMS schema, and verified restore to an empty, separate database and clean directory with exact file comparison.

## Measured bounded performance

Six-worker loopback reliability check: 120 requests completed in approximately 763 ms. Per-route p95 latency: homepage 78 ms; professional quick view 72 ms; Creative Lab 59 ms; public CMS JSON 44 ms; project detail 81 ms. No request errors.

Headless unthrottled Chromium, light appearance, controlled fixture content:

| View | Route | TTFB | FCP | observed LCP | observed CLS |
| --- | --- | --- | --- | --- | --- |
| 390px | Home | 19 ms | 744 ms | 744 ms | 0 |
| 390px | Brief | 5 ms | 108 ms | 108 ms | 0 |
| 390px | Project | 6 ms | 132 ms | 132 ms | 0 |
| 1440px | Home | 13 ms | 464 ms | 464 ms | 0 |
| 1440px | Brief | 6 ms | 132 ms | 132 ms | 0 |
| 1440px | Project | 7 ms | 224 ms | 224 ms | 0 |

**Important:** these results reflect CI loopback with no network throttling and a tiny test image, not typical visitors. They do not demonstrate real-device, public-hosting, p75 LCP/INP/CLS or peak capacity requirements.

## Outstanding production acceptance gates

The following tests **cannot truthfully be declared complete** before real staging infrastructure and owner access:

1. Live HTTPS origin, DNS, headers, certificates and redirects. Run the read-only production smoke script against the actual domain.
2. Real owner sign-in and OTP email delivery through a verified sender; confirm logout, recovery policy and session handling.
3. A real inbound contact submission and destination inbox verification, including reply-to and provider failure paths.
4. Persistent disk uploads across deployment/restart, image/video presentation, and correct media backup procedures.
5. Full PostgreSQL backup and offsite media backup, followed by restore into a **separate** staging account/server. The public-content import is not a complete owner-credential/system restoration.
6. Physical iOS Safari and Android Chrome, plus Firefox/Edge; keyboard-only review and NVDA/VoiceOver checks.
7. Representative 4G/mobile user performance, Lighthouse, measured Core Web Vitals and host-sized sustained load testing. Target good p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 when field data is available.
8. Operational alerting, log retention/privacy, incident handling, rollback rehearsal, secret rotation and backups.
9. Content, SEO, media licensing, résumé, privacy notice, exact external links and legal review.
10. Independent threat-model/security review, including upload media parsing and CSP hardening opportunities.

## Release verdict

**CI engineering gates:** PASS for the recorded workflow run.  
**Highest-severity outstanding automated defects after fixes:** None identified in the covered suite.  
**Live production gate:** ON HOLD until the staging/live-only acceptance checklist is executed and documented.  
**Next permitted action:** Merge the verified SQA fixes/tests; then provision staging and carry out the pending checks. Never claim absolute bug-free software or complete security testing.

## Repeatable commands

Use the existing safe local database and environment:

- npm ci
- npm run check
- npm run db:migrate
- npm run db:status

The added security, load and browser scripts are restricted to disposable GitHub CI loopback. Never aim these tests at the owner's production records.

After a real HTTPS domain is ready, run this **read-only** verification:

    npm run smoke:production -- https://your-actual-domain.example

Keep the CI workflow URL and this SQA report with the production launch checklist.
