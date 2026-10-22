# Content Fields and Validation Dictionary (Draft)

This is the **requirements-level form dictionary**, not the final PostgreSQL schema. Every publishable entry must also support explicit status, audit metadata, draft/preview controls, and optional SEO overrides as relevant. Confirm field limits during review.

## Profile & hero

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `display_name` | text | yes | 2–100 chars; public |
| `professional_title` | text | yes | 2–120; public |
| `headline` | text | yes | 10–180; homepage |
| `tagline` | text | no | <=300; public |
| `short_bio` | textarea | yes | <=500; public |
| `long_bio` | rich text | no | sanitized content, public on publish |
| `photo` | media ID | no | image only; alt text |
| `public_location` | text | no | optional visibility toggle |
| `public_email` | email | no | only if intentionally exposed |
| `availability` | enum | no | open/limited/not_available |
| `timezone` | IANA string | no | private by default |

## Site settings

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `brand_name` | text | yes | 2–80 |
| `navigation_items` | ordered refs | yes | allowed routes only |
| `hero_cta_label` | text | no | <=60 |
| `hero_cta_href` | URL/path | no | safe internal/external target |
| `home_sections` | ordered enum | yes | approved section IDs |
| `theme_preset` | enum | no | allowed presets only |
| `site_default_title` | text | yes | <=65 recommended SEO |
| `site_description` | textarea | yes | <=160 recommended SEO |
| `default_og_image` | media ID | no | image; appropriate aspect ratio |

## Projects

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `title` | text | yes | 5–140 |
| `slug` | slug | yes | unique per project; lowercase letters/numbers/hyphen |
| `summary` | textarea | yes | 20–500 |
| `problem` | rich text | no | sanitized |
| `solution` | rich text | no | sanitized |
| `role` | text | no | <=120 |
| `status` | enum | yes | draft/published/archived |
| `category` | enum/text | yes | from managed vocabulary |
| `tech_ids` | skill IDs[] | no | existing skills only |
| `repository_url` | URL | no | http/https |
| `live_url` | URL | no | http/https |
| `cover_media_id` | media ID | no | image with alt |
| `gallery_media_ids` | media IDs[] | no | only authorized existing assets |
| `started_on` | date | no | valid date |
| `ended_on` | date | no | >= started_on |
| `is_featured` | boolean | no | only published featured publicly |
| `sort_order` | integer | no | >=0 |
| `published_at` | timestamp | automatic | UTC |

## Research & experiments

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `title` | text | yes | 5–200 |
| `slug` | slug | yes | unique |
| `research_status` | enum | yes | idea/ongoing/completed/published |
| `abstract` | rich text | no | sanitized |
| `research_question` | textarea | no | <=2000 |
| `hypothesis` | textarea | no | <=2000 |
| `methodology` | rich text | no | sanitized |
| `models_frameworks` | tags | no | controlled/free text |
| `datasets` | text/links | no | sources + access caveat |
| `metrics` | structured list | no | metric/units/evaluation protocol |
| `results` | rich text | no | no unsubstantiated claims |
| `limitations` | rich text | no | required for published formal result if applicable |
| `authors_or_collaborators` | structured list | no | consent/attribution |
| `code_url` | URL | no | valid URL |
| `paper_url` | URL | no | valid URL |
| `media` | media IDs[] | no | existing assets |
| `status` | enum | yes | draft/published/archived |

## Publications

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `title` | text | yes | 5–200 |
| `authors` | ordered people | yes | at least one |
| `venue` | text | no | journal/conference/repository |
| `doi` | text | no | DOI syntax if present |
| `arxiv_id` | text | no | if present |
| `published_on` | date | no | valid |
| `abstract` | rich text | no | sanitized |
| `pdf` | media ID/URL | no | controlled |
| `related_research_id` | research ID | no | valid reference |
| `publication_type` | enum | yes | preprint/workshop/conference/journal/other |
| `status` | enum | yes | draft/published/archived |

## Education

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `institution` | text | yes | 2–160 |
| `degree` | text | yes | 2–140 |
| `field` | text | no | <=160 |
| `start_date` | date | no | valid |
| `end_date` | date | no | >=start unless ongoing |
| `is_current` | boolean | no | handles ongoing |
| `grade` | text | no | optional public disclosure |
| `thesis` | text | no | optional |
| `description` | rich text | no | sanitized |
| `sort_order` | integer | no | >=0 |
| `status` | enum | yes | draft/published/archived |

## Experience

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `organization` | text | yes | 2–160 |
| `role_title` | text | yes | 2–160 |
| `employment_type` | enum | no | internship/full-time/part-time/freelance/volunteer/other |
| `start_date` | date | yes | valid |
| `end_date` | date | no | >= start unless current |
| `is_current` | boolean | no | current vs end date consistent |
| `location` | text | no | optional |
| `responsibilities` | rich text | no | sanitized |
| `outcomes` | rich text | no | use evidenced claims |
| `skills` | skill IDs[] | no | existing skills |
| `status` | enum | yes | draft/published/archived |

## Skills

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `name` | text | yes | 2–80 |
| `category` | enum/text | yes | language/backend/frontend/database/AI-ML/cloud/tools/other |
| `evidence_summary` | textarea | no | optional explanation, not arbitrary % score |
| `icon` | string | no | approved icon set |
| `sort_order` | integer | no | >=0 |
| `is_featured` | boolean | no | featured section |

## Credentials & achievements

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `title` | text | yes | 3–180 |
| `issuer` | text | yes | 2–140 |
| `issued_on` | date | no | valid |
| `expires_on` | date | no | if applicable |
| `credential_id` | text | no | do not expose private secrets |
| `verification_url` | URL | no | valid |
| `description` | textarea | no | <=2000 |
| `evidence_media` | media ID | no | allow safe PDF/image |
| `status` | enum | yes | draft/published/archived |

## Writing & articles

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `title` | text | yes | 5–160 |
| `slug` | slug | yes | unique |
| `excerpt` | textarea | yes | 20–500 |
| `body` | rich text | yes | sanitized editor JSON/HTML output |
| `tags` | string[] | no | normalized tags |
| `cover_image` | media ID | no | image+alt |
| `references` | URL/list | no | safe URLs |
| `published_at` | timestamp | automatic | UTC on first publish |
| `status` | enum | yes | draft/published/archived |

## Open source

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `title` | text | yes | 3–140 |
| `repository_url` | URL | yes | GitHub/GitLab/etc |
| `contribution_type` | enum | yes | commit/PR/maintainer/other |
| `description` | textarea | yes | <=2000 |
| `evidence_url` | URL | no | public proof |
| `status` | enum | yes | draft/published/archived |

## Social links

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `platform` | enum/text | yes | GitHub/LinkedIn/ORCID/Scholar/etc |
| `label` | text | yes | <=100 |
| `url` | URL | yes | http/https valid |
| `sort_order` | integer | no | >=0 |
| `is_public` | boolean | yes | explicit visibility |

## Resume

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `file` | media ID | yes | PDF only; verified type and file size |
| `display_name` | text | no | <=100 |
| `is_public` | boolean | yes | off until published |
| `updated_at` | timestamp | automatic | UTC |

## Contact message

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `sender_name` | text | yes | 2–120 |
| `sender_email` | email | yes | RFC-style validation |
| `subject` | text | yes | 3–160 |
| `message` | textarea | yes | 10–5000 |
| `consent` | boolean | conditional | per privacy/legal decision |
| `created_at` | timestamp | automatic | UTC |
| `handling_status` | enum | automatic | new/read/archived/deleted |

## SEO & redirects

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `page_ref` | route/content ID | yes | existing public entity |
| `meta_title` | text | no | <=65 recommended |
| `meta_description` | textarea | no | <=160 recommended |
| `og_image` | media ID | no | valid public image |
| `canonical_override` | URL | no | approved host/intent |
| `old_slug` | slug | for redirects | unique old path |
| `new_path` | path | for redirects | existing or reserved path |

## Auth & account

| Field | UI/data type | Required | Validation and behavior |
|---|---|---|---|
| `email` | email | yes | unique/verified and non-public |
| `password_hash` | secret | yes | Argon2id hash only |
| `email_code_digest` | secret | temporary | short TTL, one-time use, attempt limits |
| `session_id` | secret | temporary | opaque rotated identifier, expires/revocable |
| `created_at` | timestamp | automatic | UTC |
| `audit_event` | structured | automatic | no secrets |

## Cross-cutting rules

- All links allow approved `http:`/`https:` destinations; disallow `javascript:` and unsafe schemes.
- Server validation is authoritative. Client-side feedback is usability only.
- Valid, reusable media must have metadata and alt text when displayed as informative images.
- Requiredness is conditioned by publish status; draft save can allow incomplete fields while publishing enforces required fields.
- Repeated content supports safe ordering and pagination.
- Draft previews must be private, non-indexable and time/authorization constrained.
- Public-facing private email/location/grade are off by default.
- Content revision history is retained for important edits; audit retention and contact deletion policy must be determined.