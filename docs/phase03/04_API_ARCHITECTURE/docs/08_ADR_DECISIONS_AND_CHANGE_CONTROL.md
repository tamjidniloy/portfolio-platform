# 03.4.8 — Interface Design ADR Candidates and Change Control

| ADR | Decision | Proposed approach | Alternatives still open | Needed before |
|---|---|---|---|---|
| API-001 | React Router + Express boundary | Server loaders/actions with narrow JSON resources | Full dedicated REST BFF layer | Scaffold/router |
| API-002 | Public API reach | Internal use first; no broad external API promise | Stable public API now | Final release API |
| API-003 | Response error language | RFC 9457-like `application/problem+json` | Simple envelope | Form/client tests |
| API-004 | Optimistic concurrency | Strong `If-Match` revision tokens | expectedRevision field / row lock only | Editor APIs |
| API-005 | Idempotent mutations | Scoped Idempotency-Key on POST writes | Serialized queue/unique DB command IDs | Retry flows |
| API-006 | Authentication/cookie/CSRF | Server sessions, cookie, CSRF/origin | Token bearer/API key | Owner UI |
| API-007 | Collection pagination | Opaque bounded cursor | Offset/keyset exposed | Public lists |
| API-008 | Public/private caching | Conservative no shared cache by default | Explicit generation invalidation | Production CDN |
| API-009 | Media transfer | Private signed staging + finalize | Full server proxy | Storage selection |
| API-010 | Contact notification | Store + outbox; delivery async | Inline delivery | Contact service |
| API-011 | API versioning | `/api/v1` candidate, internal first | Unversioned resource endpoints | First external client |
| API-012 | Publish consistency | Transactional snapshot+outbox+audit | Multi-stage eventual public states | DB/API freeze |

All choices are **proposals**, including versioned paths; none override an unapproved SRS. Record accepted ADRs with owner/date/impact and change source. Proposal interfaces may be revised without backward-compatibility promise until owner signs off stable contracts.
