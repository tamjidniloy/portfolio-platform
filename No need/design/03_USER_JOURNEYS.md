# Phase 02.3 — Complete User Journeys (Release 1)

**Status:** DRAFT FOR UX REVIEW — visual foundation approved per ADR-UI-001.
**Source:** Phase 01 draft requirement IDs; reconcile IDs/behavior against authoritative owner-approved SRS before release design sign-off.
**Primary actors:** Visitor, recruiter, engineer, research collaborator, administrator, search crawler.
**Design principle:** Draw success, error, empty, denied and return paths; screenshots must not claim to implement real behavior.

## Journey inventory and requirements crosswalk

| ID | Journey | Critical screens/states | Provisional requirement IDs |
|---|---|---|---|
| J-01 | First-time visitor orientation | Home, menu, selected work, contact | FR-001, FR-002, FR-014 |
| J-02 | Recruiter evaluates candidate | Home, work, experience, resume, contact | FR-001, FR-003, FR-008, FR-012, FR-013 |
| J-03 | Engineer evaluates project | Projects, project detail, external code/demo, 404 | FR-003, FR-004, FR-044 |
| J-04 | Research collaborator evaluates study | Research list/detail, status, methodology, references | FR-005, FR-006, FR-022 |
| J-05 | Contact inquiry | Contact form, validation, sending, success/failure | FR-013, FR-046 |
| J-06 | Admin authentication | Login, email challenge, dashboard, errors | FR-018, FR-038–FR-041 |
| J-07 | Account recovery | Request, email, reset, session invalidation | FR-042 |
| J-08 | Create project and publish | Index, editor, draft, preview, publish, verify | FR-021, FR-027, FR-030, FR-045 |
| J-09 | Update / unpublish / restore | Published editor, revision history, unpublish, restore | FR-027, FR-028, FR-044–FR-045 |
| J-10 | Upload and reuse media | File selection, upload status, library, safe delete | FR-026, FR-047 |
| J-11 | Manage research honestly | Research editor, research status, preview, publish | FR-022, FR-027, FR-045 |
| J-12 | Admin handles contact inbox | Inbox, message detail, retention/delete | FR-032, FR-052 |
| J-13 | Responsive and keyboard access | Small viewport, navigation drawer, form focus | NFR-001, NFR-002, NFR-018 |
| J-14 | Search crawler | Public SSR page, metadata and sitemap, no drafts | FR-045, FR-051, NFR-003 |

## J-01 — Visitor orientation
**Entry:** Direct domain URL, referral, search link. **Goal:** Understand identity and reach useful proof quickly.
**Happy:** Home -> professional headline -> featured work/research -> relevant detail -> Contact or About.
**Alternative:** If no published research/writing, hide promotional teaser and preserve usable navigation; never show fabricated content.
**Failure:** Broken detail link gets friendly 404 with Work/Research/Home navigation.
**UX success:** Identity and two meaningful destinations are apparent without scrolling through an intro animation.

## J-02 — Recruiter review
**Entry:** Homepage or a shared project URL. **Goal:** Assess skills, verified work, experience, resume, then contact.
**Happy:** Home -> selected project -> About/Experience -> Resume if enabled -> Contact -> confirmation.
**Alternative:** If resume disabled, show alternate contact/about entry rather than dead download.
**Failure:** Resume unavailable -> clear message and no broken CTA.
**UX success:** No required login, simple mobile access, no false credentials.

## J-03 — Engineering case-study review
**Entry:** /projects or permalink. **Happy:** Project index -> case study -> problem -> role/stack -> architecture/tradeoffs -> verified code or demo.
**Alternative:** No live demo or private source -> hide unavailable button, keep relevant case-study content.
**Failure:** Unpublished/missing slug -> public 404; changed slug -> redirect where appropriate.
**UX success:** Decisions and tradeoffs understandable; external links distinguish leaving site.

## J-04 — Research collaborator
**Entry:** /research. **Happy:** Explore research topics -> choose study -> see actual state -> read hypothesis/methods/dataset/results/limits -> related paper/code/contact.
**Alternative:** Ongoing study with no validated results: label clearly and omit formal publication signals.
**Failure:** Missing/draft entry -> 404; unavailable DOI -> no invalid CTA.
**UX success:** Study stage and academic publication status never conflated.

## J-05 — Contact inquiry
**Entry:** /contact or CTA. **Happy:** Fill name/email/message -> client validation -> send -> server accepts/stores -> confirmation.
**Errors:** Missing/invalid fields inline; rate limit/spam -> neutral appropriate error; network failure -> retry with entered values preserved.
**Important:** Notification email may fail after accepted storage; do not assert an email was delivered.
**UX success:** Accessible messages, no duplicate submission from repeated clicks.

## J-06 — Admin login
**Entry:** /admin/login. **Happy:** email+password -> credentials checked -> one-time emailed challenge -> enter valid code -> secure session -> dashboard.
**Errors:** Generic invalid credential message; expired/used/incorrect code; resend bounded by rate limits; service outage prevents successful verification.
**Return:** Logout -> protected admin pages no longer available; preserve safe intended-route redirect only when authorized.
**UX success:** No public signup, password never displayed in URL; no admin content leaks in anonymous view.

## J-07 — Password recovery
**Entry:** Forgot password link. **Happy:** submit email -> non-enumerating confirmation -> receive expiring token -> choose new password -> reset success -> login.
**Errors:** Expired/invalid token -> request fresh one; email undelivered -> neutral help path; weak password -> clear validation.
**UX success:** No account existence disclosure; sensitive active sessions revoked as policy requires.

## J-08 — Admin project draft-to-publish
**Entry:** Dashboard -> Projects -> New. **Happy:** enter title/summary -> Save Draft -> persisted as private -> Preview authorized -> fill publish-required fields -> Publish -> confirmation -> public detail URL verified.
**Errors:** Draft save fails -> clear error and preserve unsaved edits; publish validation fails -> focus/error summary at missing fields; session expires -> safe reauthentication flow.
**Alternative:** Featured toggle only applies when item is published; no draft exposure via lists/sitemap.
**UX success:** Save, Preview and Publish actions distinctly labeled; visible status and date.

## J-09 — Modify or unpublish a published item
**Entry:** Published content editor. **Happy:** edit -> save new revision -> preview -> publish revision -> see updated public content.
**Alternative:** Unpublish -> confirm consequence -> remove public list/direct link/sitemap. Restore old revision -> preview -> republish if desired.
**Error:** Slug change -> redirect old URL; failed operation -> preserved current public version and clear status.
**UX success:** Explicit confirmation for destructive action; change history navigable.

## J-10 — Media library
**Entry:** Admin editor/media library. **Happy:** choose valid image/PDF -> upload progress -> accessible media record -> attach -> preview -> publish.
**Alternative:** Reuse already uploaded asset; replace resume with verified new file.
**Errors:** Too large, wrong type, failed upload -> inline rejection; deletion of referenced published asset -> blocked or guided replacement.
**UX success:** File metadata and alt text where applicable; keyboard alternative to drag/drop.

## J-11 — Research CMS
**Entry:** Admin -> Research -> New/Edit. **Happy:** record actual research stage + methodology -> Save Draft -> private preview -> Publish -> public detail with truthful labels.
**Alternative:** Link to separately modeled publication only when bibliographic metadata exists; add experiment without paper.
**Errors:** Missing public-required fields -> publish blocked; unpublished study must not leak.
**UX success:** Research status and CMS publishing status are distinct controls.

## J-12 — Contact inbox
**Entry:** Admin -> Messages. **Happy:** view message list -> open message -> mark reviewed -> manage retention/delete -> return inbox.
**Errors:** Empty inbox shows calm empty state; network failure shows retry; contact PII never appears in public.
**UX success:** Message details are readable on mobile, dangerous deletion requires confirmation.

## J-13 — Accessibility and responsive routes
**Entry:** Any public/admin page. **Happy:** keyboard through skip link, header, main and footer; on mobile open drawer, follow link, close/recover focus; admin forms readable at narrow widths.
**Errors:** Validation summary navigable with keyboard; modal close/cancel returns focus.
**UX success:** Touch, keyboard, zoom, reflow and reduced-motion behavior documented.

## J-14 — Search crawler
**Entry:** sitemap/public canonical URL. **Happy:** crawl server-rendered published page, canonical metadata and internal links.
**Failure:** Draft/private preview never indexed or leaked; nonexistent slug returns appropriate status.
**UX success:** Search structure reflects the same published content visitors see.

## Design action checklist
- Every journey must map to entry, success, failure, empty and return paths.
- Every screen must have a unique prototype board ID (documented in PENPOT_FLOW_SETUP.md).
- Validate final route names and priority against approved SRS once synchronized.
- Do not mark Phase 02.3 approved until owner reviews both visitor and admin flow diagrams.
