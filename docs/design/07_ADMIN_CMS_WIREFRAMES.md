# Phase 02.7 — Full Admin CMS Wireframes

**Status:** PROPOSED / AWAITING OWNER WIREFRAME REVIEW
**Date:** 2026-10-23 (Asia/Dhaka)
**Audience:** Single owner administrator, no public user signup.
**Dependencies:** ADR-UI-001 (approved visual direction), ADR-IA-001 (approved navigation), ADR-WF-001 (approved homepage wireframes), ADR-WF-002 (approved public templates).
**Outstanding:** Owner-approved Phase 01 SRS is still not verified in GitHub main; see `docs/phase01/SRS_RECONCILIATION.md`.
**Open:** Final public-facing brand and exact font; prototype URLs not yet provided.

## Deliverables
Companion archive `DEVFOLIO_Phase02_07_Admin_Wireframes.zip` was generated in ChatGPT project conversation. Contains **54 editable SVG layouts**, a JSON manifest and preview contact sheets. These vector files are design references, not automatically instantiated responsive Penpot components or running web pages.

## Core admin experience rules
1. Separate admin shell visually from public portfolio; same origin, protected `/admin/**` route family.
2. No public registration. Credential form and emailed one-time challenge are separate steps; avoid leaking account existence.
3. Server-side authorization for every protected route/API/media request. Prototypes illustrate intent, not security enforcement.
4. Clearly separate **Save Draft**, **Private Preview**, **Publish**, **Unpublish** and **Restore** actions. Publishing needs final validation and explicit confirmation.
5. Content status (draft/published/archived) is distinct from scientific research stage (idea/ongoing/completed/published).
6. Show errors, save state, reload durability, confirmation, unsaved edits and session expiry without false success claims.
7. Asset deletion must account for published references. Contact messages remain private.
8. Desktop sidebar; mobile accessible drawer; current location and primary actions visible.
9. Use factual bracketed placeholders in wireframes; do not leak actual administrator email, credentials, or visitor PII.

## Admin information architecture
- Overview: Dashboard.
- Content: Profile, Projects, Research, Publications, Writing.
- Background: Experience, Education, Skills, Achievements, Open Source.
- Assets: Media Library, Resume.
- Communication: Contact Inbox.
- Configuration: Site Settings, SEO Settings, Account Security.
- Authentication: login, email challenge, password recovery/reset.
- Crosscutting: Private Preview, Publish Confirmation, Revision History, Loading/Empty/Validation/Failed Upload/Session Expiry.

## Page/screen matrix
| Screen / variant | Purpose | Interaction & critical states |
|---|---|---|
| ADM-01 Login | Email/password login | Generic error, no signup, submit pending |
| ADM-02 Email Challenge | Email OTP | Invalid, expired, used, resend with rate limit |
| ADM-03 Password Recovery | Non-enumerating reset request | Neutral confirmation, unavailable email provider |
| ADM-04 Password Reset | Expiring reset token | Weak password, invalid token, session revocation |
| ADM-05 Dashboard | Counts and recent changes | Real-only counts, recent activity, empty |
| ADM-06 Profile | Public headline, about, links | Visibility, save, edit validation |
| ADM-07 Projects Index | Published/draft collection | Filter/sort, empty/no matches, create/edit |
| ADM-08 Project Editor | Technical case study editing | Draft, required fields, media, preview, publish |
| ADM-09 Revision History | Compare and restore | Confirmation, saved revision, republish choice |
| ADM-10 Research Index | Research collection | Actual science stage vs publication state |
| ADM-11 Research Editor | Experiments/methods/results | Independent science stage and CMS status |
| ADM-13 Publications | Bibliographic list | Real DOI/arXiv only, relation to real study |
| ADM-14 Writing Index | Articles | Draft/published, tags, edit |
| ADM-15 Article Editor | Rich text / code / citations | Validated save and preview, safe rich-text |
| ADM-17 Experience | Career data | Real job dates, order, no fabricated roles |
| ADM-18 Education | Academic data | Dates/programs, real institutions |
| ADM-19 Skills | Taxonomy manager | Categories and associations to actual work |
| ADM-20 Achievements | Certificates/awards | Proof link and issuer validation |
| ADM-21 Open Source | Contribution records | Real repository/PR references only |
| ADM-22 Media Library | Reusable images/PDF | Uploading, type/size reject, referenced asset guard |
| ADM-23 Resume | PDF publication and replacement | Private draft vs public published PDF |
| ADM-24 Messages | Contact inbox | Unread/read, empty/error, privacy |
| ADM-25 Message Detail | Read one private message | Redaction, retention and delete confirm |
| ADM-26 Site Settings | Theme/navigation/homepage | Whitelisted route IDs, hero/footer visibility |
| ADM-27 SEO Settings | Metadata and indexing | Prevent draft/admin/previews in sitemap |
| ADM-28 Account Security | Credentials/sessions | Password verification, logout/revoke |
| ADM-29 Private Preview | View unpublished content | Auth-only, noindex/no-store |
| ST-01 Publish Confirmation | Final publish review | Explicit confirmation, failed validation returns editor |
| ST-02 Empty Collection | First-time/filtered empty | Helpful explanation and create action |
| ST-03 Upload Rejected | Media failure | File type/size limits, retry |
| ST-04 Validation Errors | Invalid publish request | Error summary, inline messages, preserve edits |
| ST-05 Session Expired | Protected session failure | Safe reauth, no unauthorized content |
| ST-06 Mobile Navigation | Collapsible CMS nav | Focus/keyboard/close/current section |

Important: the Phase 02.4 IA route map also includes `/admin/projects/new`, `/admin/projects/:id/edit`, `/admin/research/new`, `/admin/research/:id/edit` etc.; these reuse editor page families rather than requiring duplicated shell designs. This is a screen/variant inventory, not a new set of unapproved routes.

## 1. Authentication & account recovery
- Centered focused auth layout, no persistent admin sidebar until fully authenticated.
- Generic invalid credential messaging and no account enumeration.
- Email verification should explain delivery/resend limits but not reveal other users.
- Password reset uses expiring server-validated token and generic success.
- Logged-out/expired session must not show protected cached screen content.

## 2. Overview dashboard
- Status tiles: real published records, drafts, unread messages (or truthful empty state).
- Sections: recent activity, needs attention, quick tasks.
- No fabricated analytics or visitor count; optional analytics only after actual integration.

## 3. Admin indexes (Projects/Research/Writing/etc.)
- Search and filters as needed; clear active status.
- Item row: title, status, updated date, edit/open, optional bulk behavior only if approved.
- Empty content vs no-results-after-filters must use distinct messages.
- Table headings remain readable; mobile turns record rows into touch-safe cards rather than squeezing 5 columns into 390px.

## 4. Editor pattern
1. Confirm module and record identity.
2. Enter actual content fields; section tabs where long.
3. Save Draft with visible pending/success/error status.
4. Private Preview requires active admin session.
5. Publish checks public-required fields and authentic URLs before confirmation.
6. Published revision changes are traceable; restore old revision as a reviewed operation.
7. Unsaved changes warning on navigation away; keyboard and screen reader error summary.

For Research, scientific stage and CMS publish state **must not share one select**.
For Article, rich-text content must support headings, code, links, figure captions and safe rendering.
For Profile/Site Settings, changing visible public content should follow defined update/publish semantics from the final SRS.

## 5. Publishing and revision states
- Draft: saved but not public.
- Preview: private authenticated render of current draft.
- Publish: explicit confirm, validated; only then public record.
- Unpublish: confirm consequence (public URL/related links/sitemap removed).
- Restore: choose historical version, preview; distinguish restoring content from immediately publishing.
- Failure: no optimistic 'Published' label until server confirms outcome.

## 6. Assets and resume
- Dropzone and manual Choose File alternative, file metadata and upload progress.
- Validate actual permitted type/size/server policy; rejected files are not retained as successes.
- Media reference check before delete.
- Resume replacement: upload -> preview -> publish -> verify public link -> safely remove old public reference if desired.

## 7. Contact inbox
- No public exposure or SEO indexing of names, email addresses and messages.
- List/read/archive/delete with explicit policy-driven retention.
- Confirmation screens should not invent sent/replied emails.

## 8. Settings & security
- Public navigation customization restricted to safe whitelisted route IDs (ADR-IA-001).
- SEO controls cannot index admin pages or drafts.
- Security requires reauthentication where necessary, session revocation and server error handling.
- No secrets may appear in prototype data.

## 9. Accessibility and responsive behavior
- Desktop reference width: 1440px, sidebar around 240px, content around 1095px.
- Mobile reference width: 390px; single-column forms; clear current location; nav drawer and accessible action placement.
- Additional QA at 320 CSS px, 200% zoom, keyboard-only interaction, error summary focus and screen-reader labels.
- Modal focus trapping/return, ESC handling, confirm/cancel order and reduced motion require explicit prototype annotations.
- SVG import is not proof that native responsive Penpot constraints work.

## 10. npm-first engineering handoff (future phases only)
- Accessible primitives and basic components: shadcn/ui and suitable Radix primitives.
- Forms and validation: react-hook-form, zod, @hookform/resolvers.
- Tables/filters: @tanstack/react-table.
- Rich text: @tiptap/react / starter-kit (plus verified extensions).
- Media file chooser: react-dropzone; storage and authorization are separate server concerns.
- Icons: lucide-react.
- Form/table components must not replace server-side validation, session authorization or upload controls.
- Confirm exact JS support, maintenance, license and version compatibility before installing in Phase 04+.

## Acceptance gate
Owner approval for admin wireframe structure, appropriate status/error/empty variants, Penpot native screen building, approved SRS field mapping, security UX review and sign-off record. **Phase 02.7 is currently proposed, not approved.**
