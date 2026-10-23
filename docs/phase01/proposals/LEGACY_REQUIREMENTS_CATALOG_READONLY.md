# Requirements Catalog (Draft v1.0)

**Priority:** P0 = required for Release 1, P1 = enhancement, P2 = later. Requirements are proposals pending owner approval.

## Functional requirements

### Public site

| ID | Requirement | Specification | Priority |
|---|---|---|---|
| FR-001 | Public home | Visitor can view a published, responsive homepage with biography, featured work and clear calls to action | P0 |
| FR-002 | Profile | Public about page shows only owner-approved profile information | P0 |
| FR-003 | Project listing | Published projects support ordering, featured status and detail navigation | P0 |
| FR-004 | Project detail | Each published project has stable slug URL and engineering case study | P0 |
| FR-005 | Research listing | Published research entries show their actual statuses and categories | P0 |
| FR-006 | Research detail | Research page supports methods, datasets, results, limits and links | P0 |
| FR-007 | Education | Published education records display in configured order | P0 |
| FR-008 | Experience | Published work history displays appropriate dates and roles | P0 |
| FR-009 | Skills | Skills are grouped into editable categories and rendered publicly | P0 |
| FR-010 | Achievements | Certifications and achievements with optional verification URLs appear when published | P0 |
| FR-011 | Writing | Published articles have listing and individual pages | P0 |
| FR-012 | Resume | Public resume download works when enabled, and is hidden when disabled | P0 |
| FR-013 | Contact | Visitor can submit validated contact message and receive non-misleading success/failure feedback | P0 |
| FR-014 | Social links | Public social/profile links derive from admin settings | P0 |
| FR-015 | Search and filters | Visitors can filter projects/research/articles by supported attributes | P1 |
| FR-016 | Open source | Owner can publish notable public contributions | P1 |
| FR-017 | Speaking | Owner can publish talks/events and links | P2 |

### Admin & content

| ID | Requirement | Specification | Priority |
|---|---|---|---|
| FR-018 | Admin access | Anonymous visitors cannot read private admin content or use admin mutations | P0 |
| FR-019 | Profile CRUD | Admin can edit and publish profile and site biography | P0 |
| FR-020 | Career CRUD | Admin can manage education and experience records | P0 |
| FR-021 | Project CRUD | Admin can create/update/reorder/archive projects | P0 |
| FR-022 | Research CRUD | Admin can create/update/archive research items and publications | P0 |
| FR-023 | Skills CRUD | Admin can manage skills and display categories | P0 |
| FR-024 | Credentials CRUD | Admin can manage certifications and achievements | P0 |
| FR-025 | Article CRUD | Admin can write rich-text articles and manage references | P0 |
| FR-026 | Media library | Admin can upload, reuse, replace and safely remove images/PDFs | P0 |
| FR-027 | Content publishing | Publishable content supports draft, preview, publish and unpublish | P0 |
| FR-028 | Revision history | Important publishable content keeps restorable prior revisions | P0 |
| FR-029 | Settings | Admin can edit global site content, visibility and contact options | P0 |
| FR-030 | Featured content | Admin can choose which published items appear on homepage | P0 |
| FR-031 | SEO controls | Admin can edit title/description/social image for supported pages | P0 |
| FR-032 | Inbox | Admin can review contact submissions with retention/deletion controls | P0 |
| FR-033 | Navigation order | Admin can reorder predefined homepage sections without editing code | P1 |
| FR-034 | Appearance | Admin can choose from safe approved color/theme presets | P1 |
| FR-035 | Audit trail | Admin mutations and significant security events generate safe audit records | P0 |
| FR-036 | Scheduled publishing | Admin can schedule future publication | P2 |
| FR-037 | Auto-sync | Optional GitHub integrations can sync selected public repository metadata | P2 |

### Auth & operations

| ID | Requirement | Specification | Priority |
|---|---|---|---|
| FR-038 | Admin provisioning | Admin account is provisioned securely with no open registration | P0 |
| FR-039 | Password login | Valid password is required before login challenge | P0 |
| FR-040 | Email challenge | Short-lived one-use verified email challenge completes login | P0 |
| FR-041 | Secure sessions | Sessions expire, can be revoked and end on logout | P0 |
| FR-042 | Password recovery | Verified owner can complete secure password recovery | P0 |
| FR-043 | API authorization | Every private endpoint checks authenticated administrator status | P0 |
| FR-044 | Slug redirects | Old published URLs redirect appropriately when slugs change | P0 |
| FR-045 | No draft leakage | Only published data appears in anonymous SSR, APIs, feeds or sitemap | P0 |
| FR-046 | Contact notifications | Verified admin receives notification when configured, without treating failed delivery as successful | P0 |
| FR-047 | Upload constraints | Server validates authorized upload type, size and ownership | P0 |
| FR-048 | Health probes | Application exposes safe liveness/readiness behavior for hosting | P0 |
| FR-049 | Error monitoring | Critical server/application errors are observable without secret leakage | P0 |
| FR-050 | Backups | Database backup and restore operations are documented and tested | P0 |
| FR-051 | Sitemap | Public published canonical URLs appear in an XML sitemap | P0 |
| FR-052 | User deletion/privacy | Admin can handle deletion and retention of contact messages | P0 |

## Non-functional requirements

| ID | Area | Target / constraint | Priority |
|---|---|---|---|
| NFR-001 | Accessibility | WCAG 2.2 AA target for public and admin experiences | P0 |
| NFR-002 | Responsive design | Small phone through desktop; no unusable horizontal scrolling | P0 |
| NFR-003 | SEO rendering | Public core pages expose crawlable server-rendered content | P0 |
| NFR-004 | Web performance | 75th percentile LCP <=2.5 s, INP <=200 ms, CLS <=0.1 as target | P0 |
| NFR-005 | Password security | Industry-standard Argon2id password hashing; no plaintext storage | P0 |
| NFR-006 | Session security | Secure HttpOnly cookie configuration, rotation/revocation and server storage | P0 |
| NFR-007 | Authorization | Deny-by-default access to unpublished/admin resources | P0 |
| NFR-008 | CSRF and XSS | Authenticated mutations CSRF-protected; rich content sanitized/safely rendered | P0 |
| NFR-009 | Validation | All untrusted inputs validated on server; client validation enhances usability | P0 |
| NFR-010 | Uploads | Server-side type/size checks; file storage outside application deploy filesystem | P0 |
| NFR-011 | Data integrity | Foreign keys, uniqueness, migrations and transactions on critical writes | P0 |
| NFR-012 | Backup recovery | Automated backups and documented tested isolated restoration | P0 |
| NFR-013 | HTTPS | All production traffic served over HTTPS with appropriate redirects | P0 |
| NFR-014 | Privacy | Collect minimum personal data; public visibility explicitly controlled | P0 |
| NFR-015 | Reliability | 99.9% monthly availability aspirational target, not provider guarantee | P1 |
| NFR-016 | Supportability | Structured logs, meaningful errors and production error monitoring | P0 |
| NFR-017 | Maintainability | Modules separated by domain; documented interfaces and repeatable scripts | P0 |
| NFR-018 | Compatibility | Current Chrome, Safari, Edge and Firefox; keyboard-only usage | P0 |
| NFR-019 | Secrets | No credentials in repository or browser bundle | P0 |
| NFR-020 | Deployment | Tested staging before controlled production release | P0 |
| NFR-021 | Email resilience | Expired/used codes reject; notification failures handled clearly | P0 |
| NFR-022 | Localization readiness | Unicode support, UTC stored dates and locale-aware rendering | P1 |
| NFR-023 | Testability | P0 requirements have explicit, repeatable acceptance tests | P0 |
| NFR-024 | Cost management | Infrastructure and provider usage monitored against budget | P1 |

## Change management
A newly requested feature needs an ID, rationale, priority, owner acceptance criteria, and change-impact review. No requirement is implemented based solely on an unrecorded chat decision.
