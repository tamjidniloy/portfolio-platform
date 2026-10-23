# Phase 03.2 — Server Policy, Privacy and Threat Boundary

Public and owner routes share an origin but not privilege. The following controls are **required design constraints**, not implemented assertions.

| Entry | Identity | Policy | Response / caching |
|---|---|---|---|
| Public SSR/list/detail | anonymous | published projection only | safe DTO, published-only SEO |
| Public sitemap/search/feed | anonymous | published projection only | no draft slugs |
| Contact | anonymous | spam/rate + consent/validation | no-store |
| Login/OTP/recovery | partial/pending until challenge complete | generic feedback + TTL, replay defense | no-store/noindex |
| Owner loader | active owner session | operation/object/field read policy | no-store/noindex |
| Owner mutation | owner + CSRF | trusted server authorization, schema validation | no-store |
| Draft preview | owner session | private object permission | no-store/noindex |
| Media upload | owner session | size/type/ownership/signature | private staged ACL |

High-risk threats: SSR hydration private-field leak, guessed private IDs, cache stale after unpublish, OTP replay, session theft, CSRF/XSS/rich-text injection, unverified file type, credential/contact PII leakage in logs. Model explicit tests for each; OWASP ASVS 5.0.0 is a requirements reference only and no compliance is claimed.

Policy.auth(actor, action, resource) must run in trusted service layer. Never use spread serialization of database rows into public objects. Avoid caching protected responses. Protect object storage and backup access separately. Privacy/retention and hosting region are owner decisions.
