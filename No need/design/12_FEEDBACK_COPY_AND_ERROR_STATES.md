# Phase 02.12 — Feedback, Loading, Empty and Error UX

**Status:** PROPOSED UX COPY (not final public/site copy or actual backend behavior).
**Requirements authority:** Approved Phase 01 SRS still not in GitHub. No strings about fabricated projects, employers or research outputs.

## Voice
Concise and neutral. Tell the user: **what happened**, **what to do next**, and only when known, **what was saved**. Never use a success toast as the sole record of a major change.

## Messaging matrix
| Pattern | Example text | Follow-up action | Persistence/accessibility |
|---|---|---|---|
| Save in progress | Saving draft… | wait for server response, keep editing if safe | visible status, not repeated alerts |
| Draft saved | Draft saved. Not public. | Preview / Continue editing | persistent inline status or aria-live polite |
| Draft save failed | Draft not saved. Your changes are still in this editor. | Retry / copy changes | persistent error, don't clear form |
| Publish blocked | Review the highlighted fields before publishing. | Jump to first invalid field | summary + field errors; focus summary |
| Publish confirm | Publish this item to the public website? | Cancel / Publish | accessible dialog, safe default |
| Publish success | Published. View the public page. | Open verified canonical URL | server-confirmed, persistent status |
| Publish failed | Publishing failed. Your previously published version has not been replaced. | Retry / Review draft | only say previous unchanged if backend guarantees it |
| Unpublish confirm | Unpublish this item? Its public page will no longer be available. | Cancel / Unpublish | destructive intent clearly stated |
| Upload in progress | Uploading… | Cancel only if supported | progress message, not fake % |
| Upload rejected | File not accepted. Check its type or size. | Choose another file | persistent visible message |
| Delete referenced media | This file is used by published content. Replace references first. | Review usage | block dangerous delete until resolved |
| Filter empty | No results match these filters. | Clear filters | preserve context and controls |
| Truly empty | No projects have been added yet. | Create project (admin); visitor neutral guidance | no fake example cards |
| Public missing page | That page isn't available. | Work / Research / Home | public HTTP 404 later |
| Unexpected error | Couldn't load this section. | Retry / Go back | avoid technical stack traces |
| Contact accepted | Your message has been received. | Return Home | only after verified accepted storage |
| Contact failed | Your message wasn't sent. Please try again. | Retry, preserve input | do not imply mail provider success |
| Login challenge expired | That code has expired. Request a new code. | Resend within rate limit | no account enumeration |
| Session expired | Your session ended. Sign in again to continue. | Reauthenticate | guard private data |
| Version conflict | This item changed since you opened it. | Compare / refresh safely | no silent overwrite |

## Error content rules
- Inline field error adjacent to input and linked through description association.
- Summary at top on failed large form submission; move focus to summary when useful, not arbitrary first field without warning.
- Explicit confirmation for publishing and irreversible actions; Cancel must work.
- Avoid masking keyboard focus with sticky header/action bar.
- Server failures may not imply data is still preserved **on server**; distinguish client-held edits vs confirmed save.
- Secret inputs and visitor messages are not copied into toast content or analytics.
- Distinguish research scientific stage from CMS publishing status.

## Skeletons and loading
Use layout-sized static skeleton blocks for slow records/cards, preserve region dimensions, keep screen reader noise low. Avoid indefinite spinner with no message, fake loading delays and shimmering motion under reduced preference. For long requests provide Retry/Cancel only where actually supported.

## Empty states
- No published public research: omit featured card from home; Research hub may show truthful interest/empty content.
- No published Writing: remove main nav Writing link.
- Zero admin projects: create action; no false demo entry.
- No matches after filters: show reset, not 'create first project.'
- No resume: hide download; never deliver draft/private PDF.

## Design-only status
The examples are proposed language and behavior. Actual translated copy, finalized validation schema and runtime status notifications require later implementation verification.
