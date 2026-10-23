# Open Decisions and Assumptions Register

Do not block preparation while these are unanswered. Resolve each **before Phase 01 sign-off** if marked critical; update requirements and affected documents when decided.

| ID | Decision to confirm | Proposed default | Critical? |
|---|---|---|---|
| DEC-01 | Public display name and professional headline? | Owner-provided exact wording | Yes |
| DEC-02 | Public contact address and location visibility? | Contact form only; location hidden | Yes |
| DEC-03 | Which real projects are ready for launch? | Minimum 2 quality case studies if available; never invent work | Yes |
| DEC-04 | Research status vocabulary and real research records? | Idea/ongoing/completed/published | Yes |
| DEC-05 | Are publications distinct from experiments? | Yes, distinct types with optional link | Yes |
| DEC-06 | Public resume and personal email exposure? | Resume opt-in; direct email private by default | Yes |
| DEC-07 | Are articles part of release 1? | Yes, hide empty section until content exists | No |
| DEC-08 | Social links to display? | Owner chooses each with visibility toggle | Yes |
| DEC-09 | Domain name and desired deployment region? | Decide closer to staging/launch | No |
| DEC-10 | Analytics provider and user privacy notice? | Minimal aggregate analytics; privacy review before enable | Yes if analytics enabled |
| DEC-11 | Contact submission consent/retention period? | Decide based on legal/privacy needs before launch | Yes |
| DEC-12 | Email login challenge vs authenticator passkey/TOTP? | Password + email code initially; stronger MFA later | Yes |
| DEC-13 | Site theme and accent presets? | Dark default, light option; final UI Phase 02 | No |
| DEC-14 | Admin multi-user roles? | Single administrator; no registration | Yes |
| DEC-15 | Custom domain email verification service and budget? | Provider selection in Phase 03/09 | No |
| DEC-16 | Media limits and permitted types? | Images + PDF; exact limits during architecture | Yes |
| DEC-17 | What constitutes an evidenced research/publication result? | Reference or clear status/context when appropriate | Yes |
| DEC-18 | Data retention for revisions and audit logs? | Explicit configurable policy before deployment | Yes |
| DEC-19 | Full-stack React Router/Express version compatibility? | Pin tested release; no prerelease dependencies by default | No, Phase 03/04 |
| DEC-20 | Accessibility/performance testing devices? | Major browsers, phone and desktop test matrix | No |

## How to document a decision
`ID | Question | Approved answer | Reason | Date | Effect on requirements/fields/pages/tests`

No personal identity details should be invented in the SRS while decisions remain open.