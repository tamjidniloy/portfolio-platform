# Phase 02.4 — Screen & Route Inventory

**Status:** DRAFT FOR REVIEW
**Dependency:** `02_INFORMATION_ARCHITECTURE.md`; authoritative owner-approved SRS still pending GitHub synchronization.
**Purpose:** Stable screen IDs for Penpot boards and downstream component architecture. Screen IDs are not necessarily one React component per route.

## Public Screens
| Screen ID | Route | Template | Primary content | Expected states |
|---|---|---|---|---|
| PUB-01 | `/` | Landing | Profile, featured published projects/research, skills, contact CTA | Show sections conditionally; page must exist |
| PUB-02 | `/about` | Editorial profile | Long bio, interests, selected career highlights, approved links | Keep page, hide missing subsections |
| PUB-03 | `/projects` | Directory | Published projects, categories, sort/filter (when useful) | Friendly empty state; hide featured links if none |
| PUB-04 | `/projects/:slug` | Case study | One published project: problem, role, stack, solution, outcomes, media, real external links | Missing/draft => 404; old slug => redirect only to published new URL |
| PUB-05 | `/research` | Research directory | Published experiments/research; honest study statuses; publications grouping | No fabricated studies; empty state |
| PUB-06 | `/research/:slug` | Research detail | Research question, methods, datasets, results, limitations, collaborator/reference links | Missing/draft => 404; no paper CTA if absent |
| PUB-07 | `/experience` | Timeline | Published career and work history | Omit navigation to section when empty |
| PUB-08 | `/education` | Academic list | Published education, degree and academically relevant work | Omit navigation to section when empty |
| PUB-09 | `/skills` | Categorized list | Published skills grouped by category, related work | No fabricated proficiency ratings |
| PUB-10 | `/achievements` | Credential list | Published awards and certifications with proof links if present | Unverified claims not marked verified |
| PUB-11 | `/writing` | Editorial directory | Published articles with dates, excerpt, categories | Hide from primary when no articles |
| PUB-12 | `/writing/:slug` | Long-form reading | Published article body, references, related work, author info | Missing/draft => 404; old slug redirect if published |
| PUB-13 | `/contact` | Form | Approved contact methods, secure contact form, submission feedback | Inline success/error; preserve typed input on failure |
| PUB-14 | `/privacy` | Legal text | Privacy disclosures for contact, analytics, retention, external services | Publish policy before any relevant collection requiring disclosure |
| PUB-15 | `/404 (response)` | Error | Helpful not-found page with Home, Work, Research links | Return true HTTP 404; do not expose drafts |
| PUB-16 | `/assets/resume/...` | Document | Approved published PDF through storage delivery URL | Hide CTA if no public PDF; never expose private files |

## Admin Screens
| Screen ID | Route | Gate | Group | Essential UI |
|---|---|---|---|---|
| ADM-01 | `/admin/login` | Anonymous | Authentication | Email/password entry; generic failure, rate limits |
| ADM-02 | `/admin/verify` | Active challenge only | Authentication | One-time email challenge; expiry, resend and attempt limits |
| ADM-03 | `/admin/forgot-password` | Anonymous | Authentication | Neutral reset request form; no account enumeration |
| ADM-04 | `/admin/reset-password` | Valid token | Authentication | Set new password, token validity/error, return to login |
| ADM-05 | `/admin` | Admin | Overview | Dashboard, recent activity and content summaries |
| ADM-06 | `/admin/profile` | Admin | Content | Edit identity, hero, about, professional links and visibility |
| ADM-07 | `/admin/projects` | Admin | Content | Project list, status, filters, create link |
| ADM-08 | `/admin/projects/new` | Admin | Content | Project editor: save draft, validation, media |
| ADM-09 | `/admin/projects/:id/edit` | Admin | Content | Project editor, private preview, publish, revision access |
| ADM-10 | `/admin/research` | Admin | Content | Research list and linked publications |
| ADM-11 | `/admin/research/new` | Admin | Content | Research editor with separate research/publication status |
| ADM-12 | `/admin/research/:id/edit` | Admin | Content | Edit, preview, publish or unpublish research |
| ADM-13 | `/admin/publications` | Admin | Content | Publication list; relationships to research records |
| ADM-14 | `/admin/writing` | Admin | Content | Published/draft article index |
| ADM-15 | `/admin/writing/new` | Admin | Content | Rich-text article editor |
| ADM-16 | `/admin/writing/:id/edit` | Admin | Content | Article edit, revisions and publishing |
| ADM-17 | `/admin/experience` | Admin | Background | Experience records |
| ADM-18 | `/admin/education` | Admin | Background | Education records |
| ADM-19 | `/admin/skills` | Admin | Background | Skills and controlled categories |
| ADM-20 | `/admin/achievements` | Admin | Background | Awards/certificates; verifiable credentials |
| ADM-21 | `/admin/open-source` | Admin | Background | Open-source contributions |
| ADM-22 | `/admin/media` | Admin | Assets | Media library, upload, alt text and reference safety |
| ADM-23 | `/admin/resume` | Admin | Assets | Validate, replace and publish PDF |
| ADM-24 | `/admin/messages` | Admin | Communication | Private inbox, filters and retention controls |
| ADM-25 | `/admin/messages/:id` | Admin | Communication | Message view with privacy-aware actions |
| ADM-26 | `/admin/settings` | Admin | Settings | Navigation, hero, appearance and footer configuration |
| ADM-27 | `/admin/settings/seo` | Admin | Settings | Meta title, descriptions, preview image and canonical controls |
| ADM-28 | `/admin/security` | Admin | Account | Password, sessions, email ownership and recovery |
| ADM-29 | `/admin/preview/:type/:id` | Admin | Preview | Authorized preview, unpublished content, noindex/no-store |
| ADM-30 | `/admin/:unknown` | Admin | Utility | Protected not-found page, with dashboard return |

## Reusable page families
| Family | Screen examples | Shared structure |
|---|---|---|
| Editorial landing | PUB-01, PUB-02 | Header, hero, featured content, footer |
| Collection | PUB-03, PUB-05, PUB-11 | Page intro, optional categories, cards, empty state |
| Structured detail | PUB-04, PUB-06 | Breadcrumbs, hero, media, evidence, references, related records |
| Long-form | PUB-12, PUB-14 | Readable text width, headings, citations and footer |
| Timeline/list | PUB-07, PUB-08, PUB-09, PUB-10 | Ordered evidence and optional proof links |
| Public form | PUB-13 | Accessible labels, validation, pending and confirmation |
| Admin auth | ADM-01…04 | Focused centered form, generic errors, recovery |
| Admin index | ADM-07, ADM-10, ADM-13, ADM-14, ADM-24 | Search/filter if useful, status, create/open |
| Admin editor | ADM-06, ADM-08/09, ADM-11/12, ADM-15/16 | Sections/tabs, form labels, save/preview/publish |
| Admin resources | ADM-22, ADM-23 | File previews, upload state, safe replace/delete |
| Admin config | ADM-26, ADM-27, ADM-28 | Grouped forms, confirmations, audit feedback |

## Cross-page component plan (no npm install now)
Header / nav / mobile menu / breadcrumb / cards / section intro / badges / pagination or load-more / related content / empty-state / status feedback / accessible rich-text region / footer / admin shell / editor action bar / dialogs.

## Design states for all applicable screens
- Loading skeleton (appropriate to SSR/navigation)
- Empty collection and filtered no-results
- Error with retry/escape route
- Public 404 / private access denied / expired session
- Admin draft, saved, unsaved changes, preview, publish confirmed, archive, failed publish
- Media uploading, invalid type/size, missing alt text, referenced asset cannot be deleted
- Contact form pending, accepted, failed and rate-limited

## Content rules
Use realistic clearly labeled placeholders; no fake employment, research acceptance, live metrics or demo links. A hidden nav item does not imply a public URL can bypass publication checks.

## Penpot checklist
Each P0 screen has desktop and narrow-mobile boards or a documented shared-template variation, primary CTA, back behavior and state annotations. Keep board names with screen IDs to maintain traceability.
