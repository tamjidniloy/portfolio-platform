# 03.4.5 — Errors, Validation and Failure Resilience

The JSON resource-route error format is **proposed RFC 9457-style Problem Details**, `Content-Type: application/problem+json`, containing safe `type,title,status,code,requestId` and optionally generic detail/field pointers. Never include SQL, stack traces, identifiers of private resources, session secrets, OTPs, SMTP errors, raw contact body or unredacted request data.

| Error code | HTTP | UI reaction | Safety |
|---|---:|---|---|
| VALIDATION | 422 | Preserve safe input; summary and inline corrections | No echo of secrets |
| UNAUTHENTICATED | 401 | Redirect owner through login safely | No private loader data |
| FORBIDDEN / CSRF_REJECTED | 403 | Do not execute mutation | Avoid resource existence leakage |
| NOT_FOUND | 404 | Public not-found for draft/missing | No draft disclosure |
| CONFLICT | 409 | Ask user to review conflicting action/idempotency | No silent overwrite |
| PRECONDITION_FAILED | 412 | Refresh/merge and submit anew | No false success |
| PRECONDITION_REQUIRED | 428 | Fetch ETag and resubmit after owner action | Deny unguarded write |
| RATE_LIMIT | 429 | Retry responsibly; show safe cooldown | No account enumeration |
| DEPENDENCY_UNAVAILABLE | 503 | Preserve edits safely and retry | No false completion |

### Validation levels
Boundary: request method, auth/CSRF, content-type, size and JSON parse. Application: field allowlists, draft vs publish validation, relationships, resource authorization, revisions and session policy. Persistence: constraints, unique slugs, referential integrity and transaction concurrency. **All numeric text limits, uploaded MIME sets, password policies and privacy windows are provisional pending SRS approval.**

### Failure choreography
- DB commit fails: no success, no partial published content. Retry if safe with idempotency.
- Outbox/cache/email fails after DB commit: keep authoritative receipt; retry separately. Never claim notification delivered or cache invalidated without evidence.
- Auth email send fails: no verified session; user receives safe retry/error. Generic responses must not leak account existence.
- Media upload finalize fails: keep staged asset private, cleanup safely, no public reference.
- Contact stored but notification send fails: receipt truthfully states stored; inbox persists.
- Network timeout with unknown commit result: caller queries current state or reuses idempotency key; do not blindly reissue a publish command under a fresh key.

### Error format example
See `examples/problem_412.json`. Real client component labels/copy come from approved Phase 02 error and feedback contracts and accessibility checks later.
