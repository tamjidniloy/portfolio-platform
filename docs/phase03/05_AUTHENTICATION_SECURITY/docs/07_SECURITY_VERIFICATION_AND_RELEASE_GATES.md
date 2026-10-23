# 03.5.7 Threat-Driven Verification and Exit Criteria

## Verification levels
- **Design review (now):** documents internally consistent, decisions and assumptions explicit, route/policy matrix covers candidate API operations. This does not prove runtime security.
- **Phase 04 unit/integration:** session verifier, Argon2id, selected authenticator, OTP/replay, permission engine, CSRF, serializers, published projection, authorization.
- **Staging E2E/adversarial:** real browser + direct HTTP route probing, same-origin form attacks, malicious file and contact payloads, proxy caching, rate limits, multi-tab revision races, backup restore, dependency failures.
- **Production preflight:** domain/TLS/cookie/CSP configuration, rollback plans, monitoring/alert verification and secrets rotation rehearsal.

## QA register
`review/SECURITY_TEST_REGISTER.csv`: **all `NOT_RUN`**. The count includes auth, MFA alternatives, session/CSRF/XSS, BOLA, public/private SSR, media, data deletion, recovery and operations. Test IDs are proposals; attach tool versions, environment, timestamp, evidence and defects when executing.

## Standard guidance and claim discipline
The OWASP ASVS 5.0.0 standard is an **assurance reference and test planning framework**, not a certification; specific verified controls require a mapped, executed evidence file. NIST 800-63B-4 forbids email as out-of-band MFA, so email OTP cannot satisfy a claimed AAL2 flow. OWASP password guidance recommends Argon2id and OWASP session/CSRF cheat sheets guide HTTP controls. See `REFERENCES_AND_STANDARD_CONFLICTS.md`.

## Phase 03.5 exit as a documentation deliverable
- [x] Proposed control design, traceability, auth decision alternatives, matrices, diagrams and test cases documented.
- [ ] Owner resolves MFA/authenticator conflict (G-SEC-01).
- [ ] Owner approves authoritative SRS and any proposed FR-040 change.
- [ ] Owner approves Phase 03.5 security architecture at **design scope**.
- [ ] API/DB details, provider choices, retention and incident roles finalized.
- [ ] All runtime test cases executed with evidence, defects resolved.
- [ ] Native Penpot and accessibility testing verified.

**No checkboxes above representing external approval or runtime tests have been checked.**
