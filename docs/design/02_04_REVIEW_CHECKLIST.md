# Phase 02.4 — Information Architecture Approval Checklist

**Status:** DRAFT — awaiting owner approval
**Visual foundation:** ADR-UI-001 approved.
**SRS gate:** not complete until the approved Phase 01 document is identified in GitHub and compared with proposed routes.

## Review checklist
- [ ] All required public page routes exist in screen inventory.
- [ ] Primary nav Work, Research, About, conditional Writing, Contact is approved.
- [ ] About subpages and contextual/footer links are approved.
- [ ] Research includes publications without requiring a separate /publications route.
- [ ] Homepage section order and dynamic empty-state behavior are approved.
- [ ] Project/Research/Writing slugs and breadcrumb rules are approved.
- [ ] Private CMS routes and admin sidebar groups are approved.
- [ ] Preview/draft/unpublished content cannot be publicly accessed.
- [ ] Admin login, email challenge and account recovery screens have proper gates.
- [ ] Mobile nav, focus, skip links and access to primary actions are reviewed.
- [ ] All important routes map to a Penpot board or a documented shared template.
- [ ] Search indexing, sitemap/robots and public 404 policies are defined.
- [ ] Actual approved SRS compared against route inventory; mismatches resolved.
- [ ] Owner formally approves Phase 02.4, with a recorded date/version.

## Proposed decisions for explicit sign-off
1. Main menu: Work / Research / About / Writing (conditional) / Contact.
2. About as hub with secondary career/education/skills/achievements routes.
3. Research hub groups publication records.
4. Dynamic public menu driven by whitelisted CMS route IDs.
5. Empty optional hubs can show helpful empty state but remain noindex until useful published content exists.
6. Private preview stays within authenticated admin route group.

## Merge policy
Keep documents on the draft PR branch. Do not merge or label final Phase 02 approval until the above checks pass and the SRS is synchronized.
