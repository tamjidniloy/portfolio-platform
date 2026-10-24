# Phase 02.6 — Public Page Template Design Specification

**Status:** OWNER APPROVED AT WIREFRAME LEVEL — see ADR-WF-002; SRS reconciliation and Penpot/accessibility checks remain open
**Last updated:** 2026-10-23
**Parent approvals:** ADR-UI-001 (visual); ADR-IA-001 (navigation and IA); ADR-WF-001 (homepage PUB-01 at wireframe level)
**Source dependency:** Approved Phase 01 SRS synchronization is still OPEN; do not declare final Phase 02 sign-off.
**Asset bundle:** `DEVFOLIO_Phase02_06_Public_Page_Templates.zip` (provided in the project conversation) with 25 editable SVGs and PNG previews.
**Scope:** This phase covers public screen IDs PUB-02 to PUB-16. PUB-01 Homepage is already approved at wireframe level in Phase 02.5.

## Goals and hierarchy
A single clear design language supports diverse professional content without confusing software project evidence with research claims. Each page family must have clear global navigation, correct breadcrumb, meaningful H1, published data only, and useful return/related links. Desktop reference 1440px; mobile reference 390px. Responsive constraints and 320px reflow must be verified in native Penpot boards.

## Page families
| Family | Screens | Shared elements |
|---|---|---|
| Professional profile | PUB-02 | Profile hero, optional media, narrative, career/education CTA |
| Collections | PUB-03 / PUB-05 / PUB-11 | Intro, optional category filter, published cards, 0-results state |
| Structured case studies | PUB-04 / PUB-06 | Breadcrumb, title/status, verified media, methodology/decisions, evidence and links |
| Background records | PUB-07 / PUB-08 / PUB-10 | Timeline/credential row, institution/organization, verified evidence |
| Skills taxonomy | PUB-09 | Grouped skills, usage context, related published work |
| Longform editorial | PUB-12 / PUB-14 | Narrow reading width, headings, media, code/citations, legal text |
| Public contact | PUB-13 | Accessible fields, validation, sending, success/failure |
| Utility | PUB-15 / PUB-16 | Actual 404 status or conditional public PDF link |

## Screen-by-screen contract

### PUB-02 /about — Professional profile
- **Purpose:** Explain professional identity, actual learning/career path, research interests and collaboration approach.
- **Desktop:** Wide editorial introduction, optional real portrait/abstract figure, clear story sections; compact career and education previews.
- **Mobile:** One-column narrative and vertically stacked background links, no horizontal figure crowding.
- **Data:** Approved public profile, interests, experience and education summaries.
- **CTAs:** Experience, Education, Skills, Contact and Resume (only if published).
- **Empty:** No fake roles or qualifications; hide empty optional blocks.

### PUB-03 /projects — Engineering collection
- **Purpose:** Recruiters and engineers find actual published work.
- **Desktop:** Intro + optional category controls + balanced two-column case-study cards.
- **Mobile:** Filter disclosure/chips accessible without overflow, one-card-per-row.
- **Data:** Only published project title, cover, roles, stack, summary, slug; appropriate sorting.
- **CTAs:** Case study; source/demo only if explicitly valid and public.
- **Empty:** Truthful collection empty state; no invented cards; optional hub indexing behavior per ADR-IA-001.

### PUB-04 /projects/:slug — Project case study
- **Purpose:** Demonstrate problem solving and architecture, not merely screenshots.
- **Desktop:** Breadcrumb, title, tech/role context, verified source/demo CTAs, hero diagram/media, problem, solution/architecture, decisions/tradeoffs, evidence/results, limitations, related work.
- **Mobile:** CTAs may stack; large diagram may use controlled scroll or fit-to-width without losing annotations.
- **Data:** One published project and published related records.
- **States:** Missing, draft or archived => HTTP 404; changed public slug => canonical redirect to published record if approved.
- **Constraints:** Never fabricate metrics or expose private code.

### PUB-05 /research — Research collection
- **Purpose:** Discover genuine research interests, studies and any formal publications.
- **Desktop:** Study cards with scientific stage badges, concise method/evidence; publication block only if verified.
- **Mobile:** One-column cards with visible actual stage.
- **Data:** Published research records; formal publication metadata separate from study scientific stage.
- **Empty:** Show interests honestly; no fake journal publications.

### PUB-06 /research/:slug — Research detail
- **Purpose:** Explain question, hypothesis, methodology, experiment, dataset/evaluation, findings, limitations, reproducibility, related publications/links.
- **Desktop:** Reading flow with strong section labels and space for real figures/plots.
- **Mobile:** Figures scale or use accessible overflow; sections stack logically.
- **Data/links:** Valid published research only; paper/DOI only if genuine and approved.
- **States:** Absent, draft or archived => 404; ongoing studies show no fake finished result.

### PUB-07 /experience — Career history
- **Purpose:** Show verifiable career/work contributions.
- **Layout:** Timeline or ordered role list with job title, actual employer, duration, responsibilities and selected related published projects.
- **Mobile:** Date moves above role; single-column row.
- **Empty:** Do not display fictitious jobs; About and skills remain available.

### PUB-08 /education — Academic background
- **Purpose:** Degree/program/institution/timeframe, relevant study and linked academic work.
- **Layout:** Same reusable timeline pattern as Experience with education-specific fields.
- **Empty:** Do not require thesis or grades; omit unavailable records.

### PUB-09 /skills — Technical strengths
- **Purpose:** Group languages, frontend/backend, data/ML, databases, infrastructure and tools actually used.
- **Desktop:** Categorized panel groups with optional links to demonstrated projects/research.
- **Mobile:** Stack panels; skill chips wrap; no pseudo-precision ratings.
- **Empty:** Hide unpopulated categories.

### PUB-10 /achievements — Verified credentials
- **Purpose:** Real certifications, awards and accomplishments.
- **Layout:** Credential rows with issuer, date and optional proof link.
- **States:** Unverified items must not show verified mark.

### PUB-11 /writing — Article collection
- **Purpose:** Published technical writing, research notes and thought pieces.
- **Layout:** Editorial cards, approved excerpts, tags and dates.
- **Nav policy:** Hidden from primary navigation until published writing exists.
- **Empty:** Optional route may show truthful no-content state; policy of indexing pending final SRS reconciliation.

### PUB-12 /writing/:slug — Article reader
- **Purpose:** Long-form content with code, figures, references and proper attribution.
- **Layout:** Readable text column, article metadata, optional cover, section anchors and related published work.
- **Mobile:** Code requires accessible horizontal scrolling rather than whole-page overflow.
- **State:** Missing/unpublished => 404; redirect renamed canonical slug if valid.

### PUB-13 /contact — Contact
- **Purpose:** Professional collaboration inquiries.
- **Fields:** Name, email, message; final validation rules come from approved SRS.
- **States:** Idle, invalid, sending, saved/accepted, throttled, server failure; retain input on failure.
- **Privacy:** Avoid claiming email delivered when only message persistence is known; link to privacy policy as applicable.

### PUB-14 /privacy — Privacy information
- **Purpose:** Clearly disclose real contact-data processing, analytics, services, retention and rights.
- **Layout:** Narrow accessible reading width and logical headings.
- **Important:** Placeholder legal copy **must not** ship to production; finalize for actual providers and applicable law.

### PUB-15 /404 — Not found
- **Purpose:** Helpful 404 with Home, Work, Research routes.
- **Implementation:** HTTP 404, not just decorative 404 text. No unpublished content leakage.

### PUB-16 /assets/resume/... — Conditional resume delivery
- **Purpose:** A public download link/control and missing-file state, not necessarily a dedicated HTML page.
- **Behavior:** Only show if approved published PDF available, with safe object access and meaningful file label.
- **Privacy:** Never expose private resume drafts.

## Reusable components
GlobalHeader, MobileNavDrawer, Footer, Breadcrumbs, EditorialHero, SectionHeading, ProjectCard, ResearchCard, StatusLabel, MediaFigure, TechnicalTags, TimelineItem, CredentialRow, LinkCTA, EmptyState, ErrorState, ContactFormField, PublicationReference, RelatedContent, ArticleCodeBlock.

## Component design states
Default, focus, hover, active, disabled, loading, empty, validation error, success, unavailable and appropriate publish/unpublish visibility. Each component must carry its semantic intent and keyboard behavior.

## Data visibility and content governance
- Treat every bracketed placeholder as invented demonstration copy, never publish it as a real user biography, project, employer or publication.
- Only published records and related published targets appear on public pages, SSR HTML, sitemaps and preview images.
- Scientific stage (idea/ongoing/completed/formally published) is **not** CMS publication state.
- External CTAs require real, approved destination URLs.
- Responsive UI must work without compulsory motion/animations.

## UX acceptance / later implementation
1. Every required public page has an approved template and correct breadcrumbs.
2. Directory views demonstrate populated and empty states.
3. Case-study templates include a problem, your role, technical decision and evidence.
4. Research separates scientific progress from publication state.
5. Contact, missing content, disabled resume and safe preview states are designed.
6. Desktop and mobile prototypes are accessible, keyboard usable and adaptable at 320px.
7. Component design can map to maintained npm dependencies but no installs are required now.
8. Final sign-off requires reconciling approved Phase 01 SRS on GitHub.
