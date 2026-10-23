# Acceptance Coverage Plan — Proposed SRS v1.1

**Status:** PROPOSED, owner review needed. **No test execution is asserted.**

## Legacy baseline
- 52 functional + 24 nonfunctional requirement IDs, all preserved.
- 43 original acceptance-test cases AT-001..AT-043; mapping reaches 58 of 76 IDs.
- 18 requirement IDs lack an explicit legacy AT linkage; original `LEGACY_PROPOSED_GAP_TESTS.csv` contains 18 proposed additions.
- Neither 43 original tests nor 18 proposals are marked passed. Design QA 52+42+48 remains NOT_RUN.

## Recommended tests and evidence by class
| Class | Test strategy | Required evidence (future) |
|---|---|---|
| Published-only SSR and routes | Anonymous raw HTML, API, sitemap, cache, redirected slug, 404 test | Captured response and test run |
| Owner auth / email challenge | Incorrect/used/expired code, rate limit, session expiration, CSRF, recovery | Security integration and threat model |
| Draft/save/publish/revisions | Unsaved content, failed save, version conflict, restore, unpublish | Integration tests with DB assertions |
| Media and contact | Rejected type/size, published usage constraint, notification failure separate from message storage | Controlled integration and failure injection |
| Accessible UI | Keyboard, focus, zoom/reflow, screen readers, accessible authentication | Browser/AT test record, desktop/mobile |
| SEO/performance | Published-only crawl output, canonical metadata, p75 CWV | Raw SSR and production/staging metrics |
| Backup/restore | Isolated database restore drill, media consistency, audit trails | Dated drill checklist and logs |

## Owner decisions needed
Review 18 proposed gap tests for correctness, approve P0 coverage, assign test owners and release gates. Do not equate SRS acceptance with tests passed: approval permits future implementation, while actual verification follows implementation.
