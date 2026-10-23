# Phase 03.5 Owner Review Checklist

**All approval/implementation/QA boxes remain OPEN. This handoff does NOT request or infer approval.**

- [ ] **Critical:** choose whether to amend FR-040 to a real second factor (preferred passkey/WebAuthn or TOTP), or explicitly accept the weaker email-code legacy path **without any NIST AAL2 claim**.
- [ ] Choose approved owner recovery and authenticator reset process (and whether owner reauthentication is needed).
- [ ] Review secure single-owner provisioning, password policy and Argon2id design.
- [ ] Review server-side opaque sessions, cookie attributes, rotation/revocation and CSRF/origin policies.
- [ ] Approve deny-by-default authorization, object checks, public-only projection, private preview, unpublish/cache rules.
- [ ] Review rich editor XSS/CSP policy, private media staging and contact anti-abuse safeguards.
- [ ] Choose privacy/retention periods and lawful handling for contact, audit and backups.
- [ ] Select hosting, email, storage, session, secret managers and operational security owners later through ADR.
- [ ] Review 29 API operation security policies and the security threat register.
- [ ] Accept design QA plan with all cases **NOT_RUN**, require test execution in the running application.
- [ ] Approve **Phase 03.5 security design proposal only** after changes; no implication of SRS, DB/API implementation, Penpot/WCAG or security test approval.

A future owner approval must identify the reviewed PR and revision SHA, explicit authenticator decision and accepted deferrals. PR merge alone is **not** owner approval. No authentication or cloud credentials should ever be pasted into issue or PR comments.
