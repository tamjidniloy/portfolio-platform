# Software Requirements Specification — DEVFOLIO OS

**Version:** 1.0 Draft | **Last reviewed:** Not approved | **Owner:** Portfolio administrator

## 1. Purpose and scope
A secure, server-rendered public portfolio website plus an integrated private, form-based content management dashboard. Routine content updates must be possible without editing source code or triggering a code deployment. Functional scope is fully enumerated in `REQUIREMENTS_CATALOG.md`.

## 2. Intended audiences
Recruiters; software engineers; AI/ML researchers; collaborators; general visitors; sole administrator; search crawlers. Public visitors never need accounts.

## 3. Selected technology constraints
JavaScript, React, Node.js, Express and PostgreSQL. Preferred implementation is a modular monolith with React Router framework rendering, PostgreSQL via ORM, managed file storage, transactional email and GitHub-based CI/CD. Exact package versions must be confirmed during implementation.

## 4. System context
Visitor -> HTTPS/DNS/edge -> Node/Express + server-rendered React -> business services -> PostgreSQL; media in external object storage; transactional email via provider. The administrator uses a protected dashboard on the same application origin. Database credentials are never exposed to browsers.

## 5. Business rules
- BR-01: Public pages, APIs and sitemap show **only published** items.
- BR-02: Public visitors do not register or authenticate.
- BR-03: Administrative mutation requires an authorized, active session.
- BR-04: Content may move through draft -> preview -> published -> archived; preview URLs must be authorized/non-indexable.
- BR-05: Removing a published item removes its public exposure and search inclusion; obsolete URLs require appropriate 404/410/redirect behavior.
- BR-06: Published slug is unique within its type; old public slugs redirect on rename.
- BR-07: A research entry must identify its true status; unpublished/ongoing research may not be presented as peer-reviewed publication.
- BR-08: Files are referenced by IDs and metadata in database, stored externally, and cannot be deleted if still needed by published content without an explicit safe replacement flow.
- BR-09: Never promise email was delivered until delivery result is known; separate contact-message storage from notification success.
- BR-10: Site content and form fields may be changed through dashboard; application logic/schema changes require code release.
- BR-11: A content action logs the actor, time and action without exposing tokens or passwords.
- BR-12: Public profile values and contact/analytics retention follow explicit privacy settings.

## 6. Major functional sections
- Public: home, about, projects and case studies, research/experiments and publications, education, experience, skills, achievements, writing, contact, resume and social links.
- Admin: secure login; forms for each content type; media, drafts, publishing, history, site settings and contact inbox.
- Operations: email delivery, sitemap/SEO, asset management, monitoring, migrations and backup/restore.

**See** `REQUIREMENTS_CATALOG.md` for numbered FR requirements and `PAGE_INVENTORY.md` for page behavior.

## 7. User interfaces
Public design: restrained and accessible, responsive layouts, consistent navigation, clear professional identity. Admin design: functional forms with explicit labels, validation, save draft, preview, publish/unpublish, loading and confirmation states. Detailed visual design is Phase 02, not part of requirements sign-off.

## 8. Data requirements
Required logical entities: admin user, sessions/challenges/reset, profile/site settings, social links, skills, education, experiences, projects, research, publications, articles/tags, media/relationships, credentials/achievements, messages, revisions, audit logs and URL redirects. Exact field specifications in `CONTENT_FIELDS.md`; ERD and normalized SQL schema belong to Phase 03.

## 9. Security and privacy
Password + one-use time-bounded email login challenge. Rate-limited authentication, account recovery, session revocation, CSRF protection, secure cookies, backend authorization, file upload checks, rich-text sanitization, TLS, secret handling and log redaction. Contact submissions and analytics require defined collection and retention policy.

## 10. Non-functional requirements
See NFR-001 through NFR-024 in `REQUIREMENTS_CATALOG.md`. Release targets include accessible responsive UI, crawled SSR HTML, good Core Web Vitals, staging, restore-tested backups and zero unmitigated critical issues.

## 11. External dependencies and failures
Potential dependencies: PostgreSQL service, media storage, email service, DNS/hosting, error monitoring. Error behavior must be defined: storage failure should not corrupt a content record; email failure may allow a message to be stored but should log an undelivered notification; failed code sends cannot complete login; database outage returns graceful error.

## 12. Out of scope
Visitor registration; payments; microservices; custom inference backend; public chat; multi-author permissions; scheduled publishing; automatic third-party content synchronization; multilingual authoring — unless later approved.

## 13. Acceptance and traceability
Each P0 FR and NFR must map to one or more observable checks in `ACCEPTANCE_TESTS.md`. Example: FR-027 and FR-045 pass when a draft remains private across public SSR, APIs, sitemap and direct slug requests and becomes visible after publish without deploying.

## 14. Requirements change control
Changes after v1.0 approval receive request ID, impact on data/API/UI/security/tests, priority, sign-off and version increment. The owner decides what is added or delayed.

## 15. Approval criteria
1. All P0 requirements clear and testable.
2. All public and admin pages listed.
3. All main CMS fields and rules confirmed.
4. Content privacy and publication workflows approved.
5. Open critical decisions resolved or documented as explicit assumptions.
6. Acceptance test coverage for every P0 requirement.

**Approval:** Not yet granted. Replace with approved version/date before Phase 02.