# DEVFOLIO OS — Release 1 Approved Requirements Catalog (SRS-R1)

**Owner-approved contract baseline:** 2026-10-24 (Asia/Dhaka), following the owner's explicit acceptance in the Portfolio Website project chat. P0 = required for Release 1, P1 = enhancement, P2 = later. Source IDs 52 FR and 24 NFR are preserved. Approval is of the specification, NOT proof of runtime implementation or deployment.

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
| FR-011 | Writing | Published articles have listing and individual pages; when no public articles exist, do not show Writing in primary navigation; CMS article capability remains in scope | P0 |
| FR-012 | Resume | Public resume download works when enabled, and is hidden when disabled | P0 |
| FR-013 | Contact | Validated contact message submission with feedback reflecting what the server actually accepted; email delivery is a separate outcome | P0 |
| FR-014 | Social links | Public social/profile links derive from admin settings | P0 |
| FR-015 | Search and filters | Visitor filters for projects/research/articles are enhancements; a design affordance does not authorize an implemented filter before data/API work is planned | P1 |
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
| FR-027 | Content publishing | Server-authoritative draft, authenticated private preview, publish, unpublish and archive; never show client-predicted Published/Saved as confirmed | P0 |
| FR-028 | Revision history | Important publishable content keeps restorable prior revisions | P0 |
| FR-029 | Settings | Admin can edit global site content, visibility and contact options | P0 |
| FR-030 | Featured content | Admin can choose which published items appear on homepage | P0 |
| FR-031 | SEO controls | Editable SEO title/description/OG image with published-only canonical indexing and applicable metadata; no private preview indexed | P0 |
| FR-032 | Inbox | Admin can review contact submissions with retention/deletion controls | P0 |
| FR-033 | Navigation order | Optional owner reorder of predefined homepage sections using a strict approved identifier allow-list, not arbitrary routes | P1 |
| FR-034 | Appearance | Safe theme-preset selection is deferred beyond Release 1; dark styling is the only approved Release 1 mode and any light token set remains dormant | P2 |
| FR-035 | Audit trail | Admin mutations and significant security events generate safe audit records | P0 |
| FR-036 | Scheduled publishing | Admin can schedule future publication | P2 |
| FR-037 | Auto-sync | Optional GitHub integrations can sync selected public repository metadata | P2 |

### Auth & operations

| ID | Requirement | Specification | Priority |
|---|---|---|---|
| FR-038 | Admin provisioning | Admin account is provisioned securely with no open registration | P0 |
| FR-039 | Passkey sign-in | A registered owner WebAuthn/passkey begins sign-in; no password is required for primary login | P0 |
| FR-040 | Verified WebAuthn challenge | Short-lived one-use signed WebAuthn assertion with challenge, RP ID, origin, signature and mandatory user verification; no emailed OTP | P0 |
| FR-041 | Secure sessions | Sessions expire, can be revoked and end on logout | P0 |
| FR-042 | Owner account recovery | Backup passkey or controlled single-use offline recovery codes with restricted recovery context and required re-verification; email alone never grants owner access | P0 |
| FR-043 | API authorization | Every private endpoint checks authenticated administrator status | P0 |
| FR-044 | Slug redirects | Old published URLs redirect appropriately when slugs change | P0 |
| FR-045 | No draft leakage | Anonymous SSR HTML, loaders, APIs, search index, feeds, sitemap and media URLs expose no draft/private data; private preview is no-store/noindex and authorized | P0 |
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
| NFR-001 | Accessibility | WCAG 2.2 AA target for public and admin; status messages, focus, zoom/reflow and accessible auth requirements; conformance only after real testing | P0 |
| NFR-002 | Responsive design | Adapt phone through desktop; test 320/360/390/768/1024/1440/1920 CSS px reference widths, 200% text zoom, 320 CSS-px equivalent reflow | P0 |
| NFR-003 | SEO rendering | Public core pages expose crawlable server-rendered content | P0 |
| NFR-004 | Web performance | 75th percentile LCP <=2.5 s, INP <=200 ms, CLS <=0.1 as target | P0 |
| NFR-005 | Authenticator security | Passwordless WebAuthn primary login; only if a password fallback is separately approved, hash passwords using Argon2id; do not persist secrets in plaintext | P0 |
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
| NFR-021 | Authentication resilience | Expired/used WebAuthn challenges and recovery codes reject; rate limits, generic errors and truthful notification failures | P0 |
| NFR-022 | Localization readiness | Unicode support, UTC stored dates and locale-aware rendering | P1 |
| NFR-023 | Testability | P0 requirements have explicit, repeatable acceptance tests | P0 |
| NFR-024 | Cost management | Infrastructure and provider usage monitored against budget | P1 |

## Approved architectural amendments

- FR-039, FR-040 and FR-042 replace password + emailed OTP with user-verified WebAuthn and controlled recovery.
- NFR-005 and NFR-021 are revised accordingly. Other IDs and priorities are preserved, including FR-034 at P2 and conditional Writing navigation.
- Original v1.1 candidate remains in `docs/phase01/proposals/` as historical design evidence; SRS-R1 and this catalog are the authoritative Release 1 product requirements.

## Change management
A newly requested feature needs an ID, rationale, priority, owner acceptance criteria, and change-impact review. No requirement is implemented based solely on an unrecorded chat decision.
