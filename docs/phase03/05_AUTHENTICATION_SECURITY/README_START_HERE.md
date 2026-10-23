# DEVFOLIO OS — Phase 03.5 Authentication & Security Architecture

**Status: COMPLETE AS A PROPOSED DESIGN/HANDOFF; OWNER REVIEW PENDING. NOT IMPLEMENTED, DEPLOYED, AUDITED OR TESTED.**  
**Date:** 2026-10-23 (Asia/Dhaka)  
**Repository:** `tamjidniloy/portfolio-platform`; intended draft PR stacked on Phase 03.4.  
**Existing approval:** Phase 03.2 logical component architecture APPROVED **at design-specification level only**; this does not approve security details.  
**Requirements gate:** Phase 01 v1.1 SRS candidate has not been expressly approved.  
**Related proposals:** Phase 03.3 PostgreSQL model; Phase 03.4 OpenAPI and SSR interfaces; neither becomes final through this handoff.

## The critical decision
The historical SRS specifies password + **email verification code** for owner login. NIST SP 800-63B-4 explicitly excludes email as an out-of-band authentication factor. We have **not silently changed the owner's requirements**. See `docs/02_AUTHENTICATION_AND_MFA_OPTIONS.md` and gate `G-SEC-01`. Recommended for stronger assurance: passkey/WebAuthn or password + authenticator-app TOTP with appropriate recovery. Email OTP remains a documented legacy option with material assurance limitations; never claim NIST AAL2 on that basis.

## Read in this order
1. `OPEN_SECURITY_ARCHITECTURE.html`: offline visual navigation.
2. `docs/01_SCOPE_BOUNDARIES_AND_ASSURANCE.md`: threat assumptions and trust boundaries.
3. `docs/02_AUTHENTICATION_AND_MFA_OPTIONS.md`: owner login decision, passkeys/TOTP/email classification and recovery.
4. `docs/03_SESSIONS_CSRF_AND_BROWSER_CONTROLS.md`: session cookies, anti-CSRF, browser headers.
5. `docs/04_AUTHORIZATION_AND_PUBLICATION_PRIVACY.md`: deny-by-default owner access and published-only content.
6. `docs/05_MEDIA_CONTACT_AND_DATA_PRIVACY.md`: upload/PII controls and redaction.
7. `docs/06_SECRETS_LOGGING_AND_INCIDENTS.md`: secrets, backup, incidents, operations.
8. `docs/07_SECURITY_VERIFICATION_AND_RELEASE_GATES.md`: test requirements, owner approval, no false pass claims.
9. `docs/08_PHASE03_6_AND_IMPLEMENTATION_BRIDGE.md`: follow-on security implementation contracts.
10. `matrices/*`: full policy and threat and verification workbooks; `contracts/*`: machine-readable **candidate** rules.

## Required invariants
- No privileged session before chosen authentication factors are confirmed; revocable server-side sessions, no credentials in browser storage.
- Public SSR, JSON, feed, sitemap, cached pages and media include **only published owner-approved data**, irrespective of route or query-string tricks.
- Private preview is authorized and `no-store/noindex`, never an SSR public mode switch controlled by client-only state.
- All owner reads and writes require server permission; writes additionally protect against CSRF and concurrent revision overwrite.
- Contact message stored != email delivered; publication committed != external cache invalidation completed.
- No secrets, contact text, challenge codes, raw session tokens or draft payloads in telemetry/audit events.
- All sample values, thresholds, identities, providers and endpoints are candidates, not shipped or verified controls.

## Evidence and scope
All **80** planned `SEC35-*` cases in `review/SECURITY_TEST_REGISTER.csv` have status `NOT_RUN`. Static YAML/JSON, CSV, Graphviz and ZIP consistency checks performed during packaging **do not constitute application security validation**. OWASP ASVS 5.0.0 provides verification structure, not compliance certification.

## Manual owner gates
Owner reviews and decides actual MFA method and recovery; SRS v1.1 authoritative approval; contact/analytics retention/privacy; provider/secrets/hosting roles; exact API/DB contracts; Phase 02 Penpot and accessibility QA. No boxes automatically checked.
