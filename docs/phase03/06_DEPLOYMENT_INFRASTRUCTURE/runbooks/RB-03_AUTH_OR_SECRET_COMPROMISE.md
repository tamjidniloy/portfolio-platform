# RB-03 — Owner account, token or deployment secret compromise
**Trigger:** unusual admin login/session, exposed GitHub/OIDC role, suspicious production change. **Status:** planned, NOT_DRILLED.
1. Treat as SEV-1 until ruled out; isolate compromised principal and stop deploy/owner mutations when safe.
2. Revoke active admin sessions/challenges and affected provider access; rotate signing/session/DB/mail/storage keys using documented staged procedure.
3. Preserve minimal access logs and immutable release evidence securely; do not include raw session tokens, OTPs or visitor PII.
4. Check public/draft access and published snapshots for unauthorized changes; restore validated revisions if necessary.
5. Notify impacted parties according to approved legal/privacy incident policy; add regression tests and review MFA method.
