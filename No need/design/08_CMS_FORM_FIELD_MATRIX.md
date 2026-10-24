# Phase 02.8 — Field, Validation, Component and Responsive Matrix

**Status:** UX DESIGN SPECIFICATION APPROVED SUBJECT TO SRS RECONCILIATION (ADR-UX-002); this field matrix remains provisional, NOT an approved final field contract
**Date:** 2026-10-23
**Inherited approval:** ADR-WF-003 approves Phase 02.7 admin WIREFRAMES only.
**Source:** Historical Phase 01 **draft** field dictionary; authoritative approved SRS is still missing on GitHub. Reconcile names, lengths and rules before coding.
**Open:** Final public brand/name and exact font family.

## Universal controls and responsive rules
- Use labels, descriptions and error messages linked to inputs. Provide field-level errors plus an error summary that moves focus appropriately on failed submit.
- Desktop reference 1440px: admin sidebar ~240px; short independent fields can form a two-column grid, long writing/media/array fields span full width.
- Mobile reference 390px: sidebar becomes accessible drawer; one-column fields, safe full-width actions, no overlap; verify at 320px and 200% zoom.
- Client validation is for UX. **Server repeats all validation and authorization** and controls publication changes.
- Draft save may omit publish-required fields while rejecting unsafe input. This matrix's “publish required” flags derive from the old draft and are provisional.
- Contact messages are inbound records; their fields are not editable admin inputs. Security hashes/OTP digests/session IDs are server-managed, never exposed as controls.
- Publishing actions are distinct from the raw `status` field. Research scientific stage is not the CMS publication state.

## Form-by-form field mappings

### PROFILE — ADM-06
**Route:** `/admin/profile`  
**Actions:** Validate → Save changes; preview resulting public state where relevant  
**Key rules:** Never make private email or precise location public by default; all public profile data must be owner approved.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `display_name` | Text input | Yes | Yes |
| `professional_title` | Text input | Yes | Yes |
| `headline` | Textarea | Yes | Yes |
| `tagline` | Textarea | No / conditional | Yes |
| `short_bio` | Textarea | Yes | Yes |
| `long_bio` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `photo` | Media picker | No / conditional | Yes |
| `public_location` | Text input | No / conditional | Yes |
| `public_email` | Email input | No / conditional | Yes |
| `availability` | Select/Combobox | No / conditional | Yes |
| `timezone` | Text input | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### SITE SETTINGS — ADM-26
**Route:** `/admin/settings`  
**Actions:** Validate → Save changes; preview resulting public state where relevant  
**Key rules:** Whitelist navigation/home section IDs; public brand name is still open; no arbitrary HTML/unsafe destination.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `brand_name` | Text input | Yes | Yes |
| `navigation_items` | Sortable route/section IDs | Yes | Yes |
| `hero_cta_label` | Text input | No / conditional | Yes |
| `hero_cta_href` | URL / safe route input | No / conditional | Yes |
| `home_sections` | Sortable route/section IDs | Yes | Yes |
| `theme_preset` | Select/Combobox | No / conditional | Yes |
| `site_default_title` | Text input | Yes | Yes |
| `site_description` | Textarea | Yes | Yes |
| `default_og_image` | Media picker | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### PROJECTS — ADM-08/09
**Route:** `/admin/projects/new | /admin/projects/:id/edit`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Unique lower-case slug; ended_on >= started_on; selected skills/media must exist and be authorized; feature only if published.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `title` | Text input | Yes | Yes |
| `slug` | Slug input | Yes | Yes |
| `summary` | Textarea | Yes | Yes |
| `problem` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `solution` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `role` | Text input | No / conditional | Yes |
| `status` | Select/Combobox | No / conditional | Yes |
| `category` | Select/Combobox | Yes | Yes |
| `tech_ids` | Tag list / repeatable array | No / conditional | Yes |
| `repository_url` | URL / safe route input | No / conditional | Yes |
| `live_url` | URL / safe route input | No / conditional | Yes |
| `cover_media_id` | Media picker | No / conditional | Yes |
| `gallery_media_ids` | Tag list / repeatable array | No / conditional | Yes |
| `started_on` | Date input | No / conditional | Yes |
| `ended_on` | Date input | No / conditional | Yes |
| `is_featured` | Switch | No / conditional | Yes |
| `sort_order` | Number input | No / conditional | Yes |
| `published_at` | Read-only timestamp | No / conditional | No |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### RESEARCH — ADM-11/12
**Route:** `/admin/research/new | /admin/research/:id/edit`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Keep research_status (science) separate from status (CMS); don't imply peer review; verify authorship, datasets and metrics.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `title` | Text input | Yes | Yes |
| `slug` | Slug input | Yes | Yes |
| `research_status` | Select/Combobox | Yes | Yes |
| `abstract` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `research_question` | Textarea | No / conditional | Yes |
| `hypothesis` | Textarea | No / conditional | Yes |
| `methodology` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `models_frameworks` | Tag list / repeatable array | No / conditional | Yes |
| `datasets` | Tag list / repeatable array | No / conditional | Yes |
| `metrics` | Tag list / repeatable array | No / conditional | Yes |
| `results` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `limitations` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `authors_or_collaborators` | Tag list / repeatable array | No / conditional | Yes |
| `code_url` | URL / safe route input | No / conditional | Yes |
| `paper_url` | URL / safe route input | No / conditional | Yes |
| `media` | Tag list / repeatable array | No / conditional | Yes |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### PUBLICATIONS — ADM-13
**Route:** `/admin/publications`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** At least one author; valid DOI/arXiv if supplied; peer-reviewed claims and venue must be genuine.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `title` | Text input | Yes | Yes |
| `authors` | Tag list / repeatable array | Yes | Yes |
| `venue` | Text input | No / conditional | Yes |
| `doi` | Text input | No / conditional | Yes |
| `arxiv_id` | Entity reference | No / conditional | Yes |
| `published_on` | Date input | No / conditional | Yes |
| `abstract` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `pdf` | Media picker | No / conditional | Yes |
| `related_research_id` | Entity reference | No / conditional | Yes |
| `publication_type` | Select/Combobox | Yes | Yes |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### EDUCATION — ADM-18
**Route:** `/admin/education`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Date order consistency and optional private grade/thesis; no fake qualifications.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `institution` | Text input | Yes | Yes |
| `degree` | Text input | Yes | Yes |
| `field` | Text input | No / conditional | Yes |
| `start_date` | Date input | No / conditional | Yes |
| `end_date` | Date input | No / conditional | Yes |
| `is_current` | Switch | No / conditional | Yes |
| `grade` | Text input | No / conditional | Yes |
| `thesis` | Text input | No / conditional | Yes |
| `description` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `sort_order` | Number input | No / conditional | Yes |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### EXPERIENCE — ADM-17
**Route:** `/admin/experience`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Current role excludes incompatible end date; outcomes and claims should be accurate.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `organization` | Text input | Yes | Yes |
| `role_title` | Text input | Yes | Yes |
| `employment_type` | Select/Combobox | No / conditional | Yes |
| `start_date` | Date input | Yes | Yes |
| `end_date` | Date input | No / conditional | Yes |
| `is_current` | Switch | No / conditional | Yes |
| `location` | Text input | No / conditional | Yes |
| `responsibilities` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `outcomes` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `skills` | Tag list / repeatable array | No / conditional | Yes |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### SKILLS — ADM-19
**Route:** `/admin/skills`  
**Actions:** Validate → Save changes; preview resulting public state where relevant  
**Key rules:** Avoid invented proficiency percentages; allow evidence links to actual published work.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `name` | Text input | Yes | Yes |
| `category` | Select/Combobox | Yes | Yes |
| `evidence_summary` | Textarea | No / conditional | Yes |
| `icon` | Text input | No / conditional | Yes |
| `sort_order` | Number input | No / conditional | Yes |
| `is_featured` | Switch | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### ACHIEVEMENTS — ADM-20
**Route:** `/admin/achievements`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Never expose sensitive credential ID; verification URL optional but claims must be authentic.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `title` | Text input | Yes | Yes |
| `issuer` | Text input | Yes | Yes |
| `issued_on` | Date input | No / conditional | Yes |
| `expires_on` | Date input | No / conditional | Yes |
| `credential_id` | Entity reference | No / conditional | Yes |
| `verification_url` | URL / safe route input | No / conditional | Yes |
| `description` | Rich-text (Tiptap) / text | No / conditional | Yes |
| `evidence_media` | Media picker | No / conditional | Yes |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### WRITING — ADM-15/16
**Route:** `/admin/writing/new | /admin/writing/:id/edit`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Rich text must be sanitized and previewed safely; links/references valid; publish required body cannot be empty.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `title` | Text input | Yes | Yes |
| `slug` | Slug input | Yes | Yes |
| `excerpt` | Textarea | Yes | Yes |
| `body` | Rich-text (Tiptap) / text | Yes | Yes |
| `tags` | Tag list / repeatable array | No / conditional | Yes |
| `cover_image` | Media picker | No / conditional | Yes |
| `references` | Tag list / repeatable array | No / conditional | Yes |
| `published_at` | Read-only timestamp | No / conditional | No |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### OPEN SOURCE — ADM-21
**Route:** `/admin/open-source`  
**Actions:** Save Draft → Private Preview → Validate → Publish / Unpublish / Archive → Revisions  
**Key rules:** Verified public repo/PR evidence where provided; no fabricated contributions.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `title` | Text input | Yes | Yes |
| `repository_url` | URL / safe route input | Yes | Yes |
| `contribution_type` | Select/Combobox | Yes | Yes |
| `description` | Rich-text (Tiptap) / text | Yes | Yes |
| `evidence_url` | URL / safe route input | No / conditional | Yes |
| `status` | Select/Combobox | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### SOCIAL LINKS — ADM-06
**Route:** `/admin/profile`  
**Actions:** Validate → Save changes; preview resulting public state where relevant  
**Key rules:** Safe schemes (https/http) only; private flag defaults off for sensitive accounts.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `platform` | Select/Combobox | Yes | Yes |
| `label` | Text input | Yes | Yes |
| `url` | URL / safe route input | Yes | Yes |
| `sort_order` | Number input | No / conditional | Yes |
| `is_public` | Switch | Yes | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### RESUME — ADM-23
**Route:** `/admin/resume`  
**Actions:** Upload PDF → Preview privately → Publish or unpublish  
**Key rules:** PDF only, server checks signatures/size/ownership, private until explicitly published.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `file` | Media picker | Yes | Yes |
| `display_name` | Text input | No / conditional | Yes |
| `is_public` | Switch | Yes | Yes |
| `updated_at` | Read-only timestamp | No / conditional | No |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### CONTACT MESSAGE — ADM-24/25
**Route:** `/admin/messages`  
**Actions:** Read → Mark Reviewed → Archive / Delete with confirmation  
**Key rules:** Inbound visitor-submitted records are READ-ONLY in admin; only review status, retention and delete confirmation editable. Consent rules depend on privacy policy.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `sender_name` | Text input | No / conditional | No |
| `sender_email` | Email input | No / conditional | No |
| `subject` | Text input | No / conditional | No |
| `message` | Textarea | No / conditional | No |
| `consent` | Text input | No / conditional | No |
| `created_at` | Read-only timestamp | No / conditional | No |
| `handling_status` | Status display/action | No / conditional | No |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### SEO — ADM-27
**Route:** `/admin/settings/seo`  
**Actions:** Validate → Save changes; preview resulting public state where relevant  
**Key rules:** Safe canonical host and approved published route IDs; redirects must not lead to private previews or loops.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `page_ref` | Entity reference | Yes | Yes |
| `meta_title` | Text input | No / conditional | Yes |
| `meta_description` | Textarea | No / conditional | Yes |
| `og_image` | Media picker | No / conditional | Yes |
| `canonical_override` | URL / safe route input | No / conditional | Yes |
| `old_slug` | Slug input | No / conditional | Yes |
| `new_path` | URL / safe route input | No / conditional | Yes |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

### SECURITY — ADM-01/02/28
**Route:** `/admin/login | /admin/verify | /admin/security`  
**Actions:** Login → Verify email challenge; recover password; revoke sessions  
**Key rules:** password_hash, OTP digest, session ID and audit data are SERVER-ONLY; actual forms include password, email code, reset passwords and session revoke, none of which leak to logs.

| Field | Component | Publish required (provisional) | Editable in admin? |
|---|---|---|---|
| `email` | Email input | Yes | Yes |
| `password_hash` | SERVER ONLY | No / conditional | No |
| `email_code_digest` | SERVER ONLY | No / conditional | No |
| `session_id` | SERVER ONLY | No / conditional | No |
| `created_at` | Read-only timestamp | No / conditional | No |
| `audit_event` | SERVER ONLY | No / conditional | No |

**Responsive:** Desktop form groups; mobile one-column; long content full width and safe action bar. Verify keyboard focus, error summary and 320px reflow.

## Proposed additional UX controls (not existing SRS fields)
- Login: password entry; email one-time code entry, reset password + confirmation; all sensitive values never logged.
- Project/Research/Article editor: optional collapsible SEO override panel and explicit Publish Confirmation.
- Media: file chooser, upload progress, rejected file details, asset reference guard and alt text.
- Site settings: optional footer text/contact availability; requiring SRS change approval if persisted.
- Message admin: separate handling-status action (not editing message contents).

## Known conflict / reconciliation gate
The detailed draft `CONTENT_FIELDS.md` includes field length and regex suggestions. **Those are not confirmed approved.** The project conversation ZIP `DEVFOLIO_Phase02_08_CMS_Forms_Pack.zip` supplies the full historical draft limits as readable Markdown, JSON and CSV; align them to the owner's real approved SRS before implementation. No schema/API contract is created by these wireframes.
