# Acceptance Tests & Requirements Traceability (Draft)

**Rule:** A feature is not complete solely because it compiles. All P0 items must have repeatable, verifiable checks.

| Test | Mapped requirement | Observable pass condition | Verification |
|---|---|---|---|
| AT-001 | FR-001 | Home loads with only published featured content | Browser + server integration |
| AT-002 | FR-003/004 | Published project listing/detail show correct approved fields | Browser E2E |
| AT-003 | FR-005/006 | Research statuses/methods/links render correctly | Browser E2E |
| AT-004 | FR-007/008/009 | Career and skills match published records | Browser E2E |
| AT-005 | FR-010 | Credentials show only published verifiable info | Integration |
| AT-006 | FR-011 | Article with rich text and references is readable | Browser E2E |
| AT-007 | FR-012 | Published PDF resume downloads; disabled link is hidden | Browser E2E |
| AT-008 | FR-013 | Valid contact creates message; invalid rejects with feedback | Integration/E2E |
| AT-009 | FR-018/043 | Anonymous and expired session cannot access admin mutation | Security integration |
| AT-010 | FR-019 | Updating profile through dashboard changes public page without deployment | E2E |
| AT-011 | FR-020 | Education and experience CRUD survive reload | E2E |
| AT-012 | FR-021 | Project CRUD validates titles/slug/URLs | Integration |
| AT-013 | FR-022 | Research CRUD handles all truthful research statuses | Integration |
| AT-014 | FR-023/024 | Skills and credentials CRUD work | E2E |
| AT-015 | FR-025 | Article rich text sanitized in rendering | Security integration |
| AT-016 | FR-026/047 | Uploads reject unauthorized, invalid or oversized files | Security integration |
| AT-017 | FR-027/045 | Draft never appears anonymously in SSR/API/sitemap | Security E2E |
| AT-018 | FR-027 | Publish exposes item without redeploy; unpublish removes | E2E |
| AT-019 | FR-028 | Revision restore yields prior published content safely | E2E |
| AT-020 | FR-029 | Settings update public navigation/CTA as authorized | E2E |
| AT-021 | FR-030 | Featured flags only feature published entries | Integration |
| AT-022 | FR-031/051 | Metadata and sitemap show canonical published URLs | SSR/SEO inspection |
| AT-023 | FR-032/052 | Inbox private and retention/removal works | Security integration |
| AT-024 | FR-035 | Admin mutation logs event without passwords/tokens | Integration |
| AT-025 | FR-038 | Public registration endpoint absent/disabled | Security |
| AT-026 | FR-039 | Incorrect password fails with generic response | Security |
| AT-027 | FR-040 | Expired/reused/wrong email code fails; valid code succeeds | Security |
| AT-028 | FR-041 | Logout/revocation ends server-side session | Security |
| AT-029 | FR-042 | Password reset uses expiring single-use verified process | Security |
| AT-030 | FR-044 | Old slug redirects to new canonical URL | Integration |
| AT-031 | FR-046 | Email failure never falsely reports delivery | Integration |
| AT-032 | FR-048/049 | Health checks and safe failure logs work | Ops testing |
| AT-033 | FR-050 | Backup restores successfully in isolated environment | Restore drill |
| AT-034 | NFR-001 | Critical flows pass accessibility review with keyboard | Manual + automated |
| AT-035 | NFR-002/018 | Pages work at agreed mobile/tablet/desktop widths | Browser matrix |
| AT-036 | NFR-003 | Public routes include readable server-rendered HTML | Raw HTML inspection |
| AT-037 | NFR-004 | Core Web Vitals measured against stated targets | Lighthouse + field data |
| AT-038 | NFR-005/006 | Credentials and sessions never stored insecurely | Security review |
| AT-039 | NFR-008/009 | CSRF and malicious rich content are rejected/neutralized | Security tests |
| AT-040 | NFR-011 | Constraints/transacted writes avoid inconsistent records | DB integration |
| AT-041 | NFR-013/019 | HTTPS on production; secrets absent from repo/bundle | Release audit |
| AT-042 | NFR-020/023 | Staging E2E passes for approved release revision | CI/staging |
| AT-043 | NFR-014 | Private fields are not serialized into public pages | Security test |

## Release 1 exit conditions
- Every P0 requirement mapped to at least one executable or explicitly documented manual acceptance test; expand mappings before SRS sign-off.
- All mapped critical test cases pass in staging.
- Security and authorization tests complete with no unmitigated critical failures.
- Production release has backup/restore evidence and smoke-test checklist.
- Remaining known limitations recorded and approved.