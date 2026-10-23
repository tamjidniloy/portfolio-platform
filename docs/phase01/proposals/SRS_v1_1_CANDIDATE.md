# DEVFOLIO OS — Software Requirements Specification v1.1 CANDIDATE

**Document status: PROPOSED AUTHORITATIVE BASELINE — NOT OWNER-APPROVED.**  
**Prepared:** 2026-10-23 (Asia/Dhaka)  
**Proposed baseline ID:** `DEVFOLIO-SRS-v1.1-CANDIDATE`  
**Owner approval:** **PENDING**. No signed-off approved source has been verified on GitHub `main`.  
**Previous reference:** Historical `docs/phase01/draft/docs/SRS.md`, which explicitly says *Version 1.0 Draft / Not approved*.  
**Source of design choices:** GitHub Phase 02 design ADRs. See `SOURCE_EVIDENCE_INDEX.md` for their complete checked paths and decision scope.

> **Proposal, not authority:** This document is intended to become the authoritative Phase 01 SRS only **after the owner reviews and expressly approves its actual text, open decisions, changes and version**. Until then, the exact schema, endpoints, field validation and security policies are not finalized. Do not overwrite or silently relabel the historical draft.

## 1. Executive scope and outcome
DEVFOLIO OS is an SEO-friendly **server-side rendered public software engineering and AI/ML research portfolio** with an independent **private owner-only CMS**. Content must be authorable, reviewed and published without editing application source code or running a new deployment. Visitor-facing material must accurately represent verified projects, roles, research stage, publications and contact information. No fabricated work, metrics or awards may be substituted for empty content.

### Stakeholders
Public visitors (recruiters, engineers, collaborators, research reviewers), search engines/crawlers, a single trusted administrator (owner), and operations personnel with hosting/backup responsibilities. No public visitor accounts.

### Release 1 in scope
- Public SSR Home, Work/projects listing and case studies, Research collection and detail (with publications grouped under Research), About, Contact, useful 404 and privacy presentation; other approved public route families (Experience, Education, Skills, Achievements, Writing, Resume if available).
- Public semantic navigation: **Work, Research, About, [Writing only when published articles exist], Contact**. Experience/Education/Skills/Achievements remain discoverable via About/footer and direct supported URLs.
- Protected owner login (password then short-lived single-use email challenge), session management and recovery; admin dashboard with CRUD for all approved content types, media, messages and settings.
- Publishing: independent *draft*, authenticated *private preview*, *published* and *archived/unpublished* states; revisions and audit event records.
- Search engine-safe canonical published URLs, metadata, redirects for old public slugs and a published-only sitemap; server-side authorization for preview/private content.
- Accessible dark-first interface with approved semantic tokens, responsive layouts, mobile admin behaviors and truthful loading/error/empty outcomes.

### Explicitly out of Release 1 scope
Visitor registration/login, payments, public chat, multi-author roles, custom inference/ML serving, microservices, automated third-party repository sync, scheduled publishing and multilingual authoring. FR-034's safe preset/theme-selection feature is **proposed for deferral to P2**; light-color design tokens may exist but **a Release 1 light-mode toggle/production light theme is not approved**.

## 2. Status and source-of-truth hierarchy
1. This v1.1 **candidate** provides proposed current requirements; it is not approved until explicit owner sign-off.
2. Historical `docs/phase01/draft/docs/*` are evidence, **not** an approved baseline.
3. Owner-approved **Phase 02 ADRs** are authoritative for their **explicit design scopes** (not for backend/API schemas or QA pass claims).
4. When historical draft requirements conflict with approved visual/interaction decisions, this proposal records a change instead of silently treating either as final requirements.
5. Priority and behavior of the 76 legacy FR/NFR IDs are preserved except for documented candidate changes in `RECONCILIATION_MATRIX.csv`; all change proposals require owner review.
6. API contracts, ORM models, database field lengths, routes not already agreed, response status details and implementation-specific timeouts are **architecture candidates**, not approved just because illustrations show them.

## 3. Engineering constraints and context
Candidate implementation: JavaScript/React Router **Framework Mode SSR**, Node with Express host integration, PostgreSQL and a modular monolith (single deployment boundary with domain-oriented modules). Use npm-first maintained primitives (accessible UI, form handling, validation and rich-text editor where applicable). Version compatibility, ORM, transaction model, deployment region, media storage, email provider, caching and CI/CD are decided through Phase 03 ADRs. Use HTTPS, secure sessions and server-owned secrets. Avoid unsupported claims that these components have already been installed or deployed.

### High-level systems
Browser/SEO bot -> TLS edge -> SSR React Router/Express application -> public published-content service / private authenticated CMS service -> PostgreSQL. Object storage holds controlled files; transactional email handles login challenges, recovery and optional contact notifications; monitoring/backups run in operations boundary. Public and private content need explicit policy enforcement at every server entry point.

## 4. Functional requirements catalog and approved design reconciliation
The requirement catalog below preserves the **76 stable legacy identifiers** (52 FR + 24 NFR). It retains historical P0/P1/P2 priorities, **except proposed change FR-034 to P2**. Clarifications to FR-011, FR-013, FR-015, FR-027, FR-031, FR-033, FR-045 and NFR-001/002 reflect approved *design behavior* and are only proposed as requirement wording until owner approves this document.

### Complete candidate requirements catalog

The complete 52 FR and 24 NFR requirement tables, with stable identifiers and every proposed wording/priority change, are maintained in [`REQUIREMENTS_CATALOG_v1_1_PROPOSED.md`](REQUIREMENTS_CATALOG_v1_1_PROPOSED.md), which forms **part of this candidate SRS**. It must be reviewed and approved together with this document; no requirement is silently omitted.

## 5. Explicit business rules and cross-cutting invariants
| Rule | Required behavior | Evidence expectation |
|---|---|---|
| BR-01 | All public SSR HTML/loaders/APIs/sitemap/search output reveal **only published** content | Negative anonymous fetch tests for draft/unpublished resources |
| BR-02 | Public visitors cannot register/login; no public account functionality | Automated route/access assertions |
| BR-03 | Every admin read/mutation requires active authorized owner session (authorization on server) | Direct API and SSR auth tests |
| BR-04 | Publish is server-validated; private preview needs authorization, no-store and noindex | E2E + network tests |
| BR-05 | Unpublish invalidates public exposures and relevant caches/search/sitemap | E2E after revalidation |
| BR-06 | Slugs are unique per content type and public historical slugs redirect correctly | Integration canonical SEO tests |
| BR-07 | Research **scientific stage** is independent of content visibility and publication type; never claim peer review without evidence | Editorial/content verification |
| BR-08 | Media references cannot be silently destroyed when published content still depends on them | DB constraints + media integration |
| BR-09 | Contact accepted/stored and email notification delivered are separate statuses | Failure-injection + messaging tests |
| BR-10 | Normal content edits do not need code deployment; schema/logic changes do | CMS-to-SSR integration |
| BR-11 | Significant admin changes and security events generate redacted audit records | Security log review |
| BR-12 | Only owner-approved personal data is publicly shown; visitor records retained/deleted per explicit policy | Privacy verification |
| BR-13 | Save Draft, Upload complete, Published/Unpublished statuses are confirmed only by authoritative server outcomes | Network-failure integration |
| BR-14 | Writing nav/featured optional sections appear only with eligible published content; absent records are not invented | Sparse content scenario |
| BR-15 | Admin-configurable navigation uses an allow-list of approved route identifiers; no arbitrary open-redirect paths | Validation tests |

## 6. Public pages, navigation and truthfulness
- Primary navigation: Work => `/projects`, Research => `/research`, About => `/about`, Contact => `/contact`; optional Writing => `/writing` only after published content exists. Display labels are design decisions, not an invitation to invent a public brand name.
- Project details `/projects/:slug` show structured role, problem, approach, evidence, outcomes, limits and genuine optional repository/demo links; avoid made-up metrics. Research `/research/:slug` shows research question, status, methods/data, outcomes/limitations and legitimate publications/links.
- Publications are modeled as their own records as needed but surfaced **within Research**, without requiring a top-level `/publications` index in Release 1.
- Secondary discoverable page families: `/experience`, `/education`, `/skills`, `/achievements`, `/writing/:slug` when supported, and privacy/information pages. Optional collection routes may render transparent empty content states; nav remains content-conditional.
- Resume download appears only for a currently authorized public PDF and explicit enabled state. Optional photo, public email, location, social profiles, blog and achievements remain hidden unless configured and genuinely populated.
- Missing, draft and unpublished detail URLs return appropriate 404; prior published slugs may redirect to valid canonical published URLs under approved redirect rules.

## 7. CMS, publication and editing behavior
- Owner CMS nav uses Overview, Content, Background, Assets, Communication and Configuration groupings. Actual route inventory and forms are traced in the Phase 02 wireframe specs.
- Publishable content supports draft editing, authenticated private preview, server-confirmed publication, unpublish/archive, and history/recovery. Draft preview must never be exposed by anonymous SSR, crawlers or public feeds.
- Define two validation modes: save-draft permits incomplete safe content; publication requires all essential evidence/fields for eligible content type. Report errors near fields and in a helpful summary without deleting entered data.
- Revisions and conflicts: no silent loss or overwrite. Architecture must specify version tokens/transactional semantics and what happens when another revision exists.
- Upload images/PDFs via strict owner authorization, type/size checks, private vs published ACL, alt text and reference guard; actual MIME policy and quotas remain open.
- Server-confirmed save/publish outcomes must produce concise persistent feedback. Offline demo/pixel specs are *not* backend behavior.
- The historical field dictionary is a candidate UI/data dictionary, **not** an approved ER model. The Phase 02.8 registry of 16 modules / 147 fields is design-mapping material, not a final SQL/API schema.

## 8. Authentication, security, data protection
- No self-service admin signup. Single-owner account provisioning is controlled and not through a public registration endpoint.
- Password before one-use time-bounded email challenge; wrong, used, expired or throttled challenges do not create a privileged session. Password manager/autofill/paste compatibility must be maintained.
- Require secure HttpOnly cookies, rotation/revocation, expiration, CSRF defenses, server-side authorization on **every protected endpoint**, account recovery controls and rate limits. Exact session TTL, cookie policy, throttling and challenge expiry require Phase 03 security ADR and owner review.
- Validate all untrusted inputs server-side; sanitize rich text and media; use prepared queries/ORM constraints; redact secrets and PII from logs/errors. Media uploads should be stored outside web deployment filesystem, with enforced authorization and type checks.
- Contact inbox is private; decide exact consent text, anti-spam, retention and deletion windows and analytics provider before production. All data access and restoration paths must maintain separation of public/private state.
- Apply transactional integrity to content publication and revisions; offline backup and restore must be tested before production.

## 9. Quality attributes and accessibility
- **WCAG 2.2 AA is a target, not an achievement**; implement keyboard-accessible dialogs/drawers/menus, visible focus, status announcements, safe labels/errors, 200% text resizing, 320px reflow and accessible authentication. Specific proposed test widths 320/360/390/768/1024/1440/1920 CSS px are QA reference points, not mandated CSS breakpoints.
- Use Phase 02 approved dark tokens: background `#10151D`, primary text `#F1F5F9`, card `#17212D`, teal primary `#70D9C3`, blue links `#9CC0FF`. Light candidate tokens remain future-ready and inactive. Exact public-facing font and brand remain OPEN.
- Motion defaults for design reference: 120ms/180ms/240ms, reduced movement, and state meaning preserved without animation. These values are not performance SLAs.
- Public page SSR must expose crawlable canonical published HTML and metadata. Target CWV p75 LCP <=2.5s, INP <=200ms, CLS <=0.1 (not yet measured). Keyboard-only and major current browser support expected.
- Security, reliability, logs/monitoring, backups, isolated restore, HTTPS, staging and no secret leakage remain required acceptance concerns. 99.9% availability is an aspirational P1 objective, not an existing provider guarantee.
- The Phase 02 QA register includes 52 responsive/a11y + 42 interactions + 48 hi-fi cases **all NOT RUN**. Real implementation, Penpot and assistive-tech evidence is outstanding. Do not claim conformance or functional tests passed.

## 10. Data domains and confidentiality boundaries
Logical record families (not finalized tables): OwnerAccount, Session, LoginChallenge, RecoveryToken, Profile/SiteSettings, SocialLink, Project, Research, Publication, Education, Experience, Skill/Category, Achievement, WritingArticle, MediaAsset/Usage, ResumePointer, ContactMessage, ContentRevision, AuditEvent, SlugRedirect. The exact split, primary keys, indexes, soft-deletion strategy, tenant decisions and payload types belong to Phase 03. A published projection should not include draft or private fields by default.

## 11. Integrations, operations and failure handling
- Managed PostgreSQL storage, media object storage and transactional email are candidates; provider and region to be approved.
- Failure modes: a media storage failure may not leave an incorrectly published record; a notification send failure may not be reported as delivered; unsuccessful OTP delivery cannot authenticate; DB outages return safe retry UX and operational observability.
- Monitoring must avoid PII/secrets. Backups, recovery point/time objectives and restore testing are architecture topics; do not invent achieved availability or security certification.

## 12. Acceptance coverage and Phase 02 handoff
- Existing Phase 01 acceptance tests `AT-001..AT-043` are historical proposed checks, **not yet executed**.
- All 76 candidate requirements must have an explicit acceptance test or a recorded exception. The recovered historical matrix maps 58 IDs; 18 IDs require explicit proposed test linkage (see `ACCEPTANCE_COVERAGE_PLAN.md` and companion CSV). None of the new tests is treated as passed.
- Phase 02 approval scope remains as recorded: approved design system/component/UX **specifications**, not a verified Penpot native prototype or a completed real app. 18 representative desktop/mobile high-fidelity templates do not constitute every public/admin screen.

## 13. Key conflicts and owner-decision gates
The companion `RECONCILIATION_MATRIX.csv` lists 28 findings with historical IDs, proposed resolution, Phase 02 supporting decision, remaining approval and risk. **The following must be resolved explicitly before v1.1 is approved and Phase 03 data/API contract baselines are locked:**
1. Confirm this SRS v1.1 candidate is the actual source intended to replace the historical draft; alternatively supply the genuinely earlier approved revision for comparison.
2. Approve proposed FR-034 P1-to-P2 deferral and Release 1 dark-only mode.
3. Confirm conditional Writing primary-nav despite Release 1 article CMS capability.
4. Confirm publications grouped within Research and independent research-scientific versus CMS-visibility status.
5. Set precise privacy/retention/consent rules for contact, analytics, audit and revisions; exact media constraints and provider decisions can be deferred as tracked architecture items if explicitly accepted.
6. Review required Release 1 content readiness (real project/research data) and public brand/name; font may remain open with explicit launch gate.
7. Accept requirement-to-test coverage plan, including missing 18 mapped test proposals, before final baseline signoff.
8. Set version/date/approver evidence; approve actual text, not a generic statement that phases were complete.

## 14. Proposed requirement change control
After owner approval, record every changed FR/NFR/business rule with ID, owner acceptance, affected CMS forms, routes, data/API, security and tests, plus migration impact, then increment baseline version. Keep ADRs and requirements linked without conflating decision hierarchy. Never reinterpret a public prototype as delivered production behavior.

## 15. Owner approval block — deliberately not signed
**Approval status:** **PENDING**  
**Proposed baseline:** `DEVFOLIO-SRS-v1.1-CANDIDATE`  
**Approved by:** *(blank — awaits owner)*  
**Decision date:** *(blank — awaits owner)*  
**Reviewed version/hash:** *(record after review)*  
**Open blockers / exceptions:** *(to be recorded by owner)*  

**Promotion procedure:** After explicit approval, create `docs/SRS.md` from the reviewed candidate, update both `docs/phase01/SRS_RECONCILIATION.md` and relevant Phase 02 traceability tables, attach the approved exact Git SHA, and request PR review before making schema/API contracts normative. There is **no approval or implementation authorization implied by this document's preparation**.
