# User Stories and Acceptance Scenarios

## Story inventory

| ID | Actor | Wants to... | So that... | Related requirements |
|---|---|---|---|---|
| US-001 | visitor | see a concise overview of the developer on the homepage | evaluate relevance quickly | FR-001 |
| US-002 | visitor | open a project case study from a listing | understand technical decisions | FR-003, FR-004 |
| US-003 | research collaborator | see precise study status, methods and limitations | evaluate work without confusion | FR-005, FR-006 |
| US-004 | recruiter | download a current resume | review qualifications | FR-012 |
| US-005 | visitor | send a contact inquiry | request collaboration | FR-013 |
| US-006 | visitor | view career and education information | assess background | FR-007, FR-008 |
| US-007 | owner | log in with password and email verification | manage content securely | FR-039, FR-040 |
| US-008 | owner | save an unfinished project as draft | finish writing it later | FR-021, FR-027 |
| US-009 | owner | preview unpublished changes privately | review before public release | FR-027, FR-045 |
| US-010 | owner | publish a completed project | make it accessible without code edits | FR-027 |
| US-011 | owner | edit a published biography | keep profile up to date | FR-019 |
| US-012 | owner | unpublish an obsolete project | stop showing inaccurate work | FR-027 |
| US-013 | owner | restore an earlier content revision | recover from mistakes | FR-028 |
| US-014 | owner | upload screenshots and PDFs | publish supporting material | FR-026, FR-047 |
| US-015 | owner | manage skills in meaningful groups | present expertise accurately | FR-023 |
| US-016 | owner | add a research experiment without claiming publication | show honest research progress | FR-022 |
| US-017 | owner | create an article using rich text | share technical knowledge | FR-025 |
| US-018 | owner | set featured projects | curate homepage | FR-030 |
| US-019 | owner | review contact messages privately | respond to professional opportunities | FR-032 |
| US-020 | owner | recover account access securely | avoid permanently losing administration | FR-042 |
| US-021 | owner | change sensitive security settings | protect admin access | FR-041 |
| US-022 | search crawler | find canonical published content in sitemap | index public site correctly | FR-051, FR-045 |
| US-023 | visitor | use the site on a phone and keyboard | access material comfortably | NFR-001, NFR-002 |
| US-024 | operator | restore backed-up data after failure | recover service | FR-050, NFR-012 |

## Detailed scenarios

### US-007 — Secure admin login
**Given** an administrator account with a verified email, **when** the correct password is supplied, **then** a limited login challenge is created, not a full session. **When** a valid, unexpired and unused emailed code is supplied, **then** an authorized session is established. Invalid, expired, reused codes fail; excessive attempts are rate-limited.

### US-008/009/010 — Draft, preview and publish
**Given** an authenticated admin, **when** an incomplete draft is saved, **then** it persists privately without publishing. **When** preview is selected, **then** only the authorized admin can see it. **When** the record satisfies publishing validation and is published, **then** anonymous visitors can access the item without code redeployment.

### US-012 — Unpublish
**Given** a published project, **when** an admin unpublishes it, **then** it disappears from listings, direct anonymous detail requests and the sitemap after revalidation.

### US-014 — Upload media
**Given** an authenticated admin, **when** a permitted file is uploaded, **then** media metadata is saved and the file is accessible according to visibility. Rejected file types, oversized files or unauthorized requests leave no accepted published asset.

### US-005 — Contact
**Given** a visitor with valid contact fields, **when** the form is submitted, **then** the message is saved once and the visitor gets accurate feedback. Invalid/spam submissions fail without exposing internal details; notification delivery is tracked independently.