# Security References and Applicability Notes (checked 2026-10-23)

| Reference | Official source | Used for |
|---|---|---|
| NIST SP 800-63B-4 (July 2025) | https://pages.nist.gov/800-63-4/sp800-63b.html | Authenticator assurance, forbidden email out-of-band authentication, recovery and authentication lifecycle |
| OWASP ASVS 5.0.0 | https://asvs.owasp.org/ | Risk-focused verification checklist, not a claim of compliance |
| OWASP Password Storage Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html | Argon2id and tuning guidance |
| OWASP Session Management Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html | Opaque sessions, cookies, replay prevention |
| OWASP CSRF Prevention Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html | Token validation, Origin, Fetch Metadata and SameSite depth |
| OWASP Authorization Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html | Deny-by-default object and function authorization |
| OWASP File Upload Cheat Sheet | https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html | File byte validation, ACL, size, quarantine and safe storage |
| RFC 9457 Problem Details | https://www.rfc-editor.org/rfc/rfc9457.html | Candidate safe error shape inherited from 03.4 |

**Critical divergence:** historical FR-040 asks for an emailed challenge after password. Per NIST SP 800-63B-4's out-of-band section, email **SHALL NOT** be used as an out-of-band authenticator. Email can still be used for address confirmation or recovery codes under scoped rules, but the legacy flow is not acceptable for NIST-compliant MFA; owner SRS change is required for an MFA claim. Do not conflate OWASP recommendations, NIST assurance levels and legal compliance.
