# 03.3.4 — Database Trust Boundaries and Privacy

**Authorization is in the application/service layer; client/route-only guards and unfiltered ORM objects are insufficient.** PostgreSQL RLS may be added as defense-in-depth after owner/session mapping and service credentials are chosen; RLS is NOT claimed implemented.

| Classification | Tables / fields | Rule |
|---|---|---|
| Secrets or secret verifiers | password_hash, token_digest, code_digest, reset token | Hash/verifier only; never log; no public DTO; strict backup ACL |
| Personal data | contact name/email/body, owner email, IP if ever stored | Private admin only; minimization, retention policy, privacy rights |
| Editable draft data | content_revisions.payload, private notes | Admin only; preview requires fresh session and no-store |
| Public approved | published_snapshots.public_payload | Explicitly allowlisted/validated, no internal ID leaks where avoidable |
| Operational security | audit/redacted metadata, outbox safe payload | No credentials, contact body or OTP in log/event bodies |
| Media | storage_key, staging URI | Private; public proxy authorizes published revision reference |

## Proposed technical controls
- App roles: service DB account with narrowly scoped grants; separately privileged migration role; no direct browser-to-DB access.
- Deny-by-default admin query/use-case authorization; object-level and field-level checks for draft/PII.
- Password Argon2id policy in application, challenge/reset digests with short TTL and one-use updates; session revocation before privileged reads.
- Parameterized SQL, safe JSONB schema validators, rich text sanitization on storage/rendering and CSP at HTTP edge.
- TLS to DB/provider; encrypted storage/backup; rotation of DB credentials and application secrets outside repository.
- A separate `1public read view` may help defense-in-depth but cannot replace application policy. No public grant to `content_revisions` or contact/auth tables.

## Retention decisions NOT resolved
- Contact submissions: legal basis, consent fields, retention duration, deletion semantics and backups.
- Audit retention/security events: operations and legal requirements, balance immutability and deletion rights.
- Old versions/media: draft history retention, orphan staging TTL, old published media URLs after unpublish.
- OTP and session data: strict time-bound purge; retain minimal abuse signals only where legitimate.

No retention durations or legal compliance certifications are invented here. Owner policy review required **before production**.
