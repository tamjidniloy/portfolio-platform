# Page Inventory and Route Requirements

Route names are proposed and subject to SRS approval; actual component design belongs to Phase 02.

| Route | Access | Required content and interaction | Failure/visibility rule |
|---|---|---|---|
| `/` | public | Hero; short bio; featured projects/research; skills; career highlights; contact CTA | Published items only; hide absent sections |
| `/about` | public | Long bio, interests, professional direction, social links | Private fields never exposed |
| `/projects` | public | Project cards; featured/ordered; optional filters | Empty state; pagination if needed |
| `/projects/:slug` | public | Case study, images, role, tech, sources, outcomes | 404 unpublished/missing; slug redirects |
| `/research` | public | Research list, status, publications, filters | No false claim of peer review |
| `/research/:slug` | public | Question, methods, data, results, limitations, references | 404 draft/missing |
| `/experience` | public | Roles and experience timeline | Hide draft |
| `/education` | public | Academic timeline | Optional detail omitted safely |
| `/skills` | public | Technologies by category | No fabricated proficiency ratings |
| `/achievements` | public | Credentials, awards, validation links | Hide unpublished |
| `/writing` | public | Published article list | Empty state |
| `/writing/:slug` | public | Full article and references | 404 unpublished/missing |
| `/contact` | public | Form and approved social/contact links | Spam protection, error/confirmation states |
| `/admin/login` | public-limited | Password and email challenge stages | Rate-limited; anonymous; noindex |
| `/admin` | admin | Dashboard summaries and pending content | Authenticated only |
| `/admin/profile` | admin | Profile settings and visibility | Draft/preview/publish |
| `/admin/projects` | admin | Project list, filters, CRUD | Auth+CSRF; audit |
| `/admin/projects/new` | admin | Project form | Auth+validation |
| `/admin/projects/:id/edit` | admin | Project form and publish controls | Auth+validation+revisions |
| `/admin/research` | admin | Research and publications CRUD | Auth+validation |
| `/admin/experience` | admin | Career CRUD | Auth+validation |
| `/admin/education` | admin | Education CRUD | Auth+validation |
| `/admin/skills` | admin | Skills/category CRUD | Auth+validation |
| `/admin/writing` | admin | Article editor and publishing | Auth+sanitization |
| `/admin/achievements` | admin | Awards/certificates | Auth+validation |
| `/admin/media` | admin | Media library and references | Auth+upload controls |
| `/admin/resume` | admin | Current public PDF | Auth+PDF validation |
| `/admin/messages` | admin | Contact message review & retention | Private PII |
| `/admin/settings` | admin | Navigation/site/SEO settings | Auth+strict control of URLs |
| `/admin/security` | admin | Password, sessions, account recovery | Strong reauthentication for sensitive operations |
| `/api/v1/*` | mixed | Versioned public and protected endpoints | Auth by route; validation and OpenAPI |

## Standard page states
Each public list/detail or admin editor has relevant loading, empty, error, success and unauthorized states. Admin data is never embedded into public HTML.

## Key flows
1. Visitor -> projects -> project detail -> code/demo links.
2. Visitor -> research -> detail -> related publication/code/dataset link.
3. Visitor -> contact -> validation -> saved message -> conditional notification -> confirmation.
4. Admin -> password -> email challenge -> session -> editor -> save draft -> private preview -> publish -> public page.
5. Admin -> replace resume -> validate PDF -> verify download -> remove old asset safely.