# 03.7.11 — Contradictions, Caveats and Deliberate Deferrals

| Finding | Why it matters | Resolution/status |
|---|---|---|
| Recovered SRS says 1.0 Draft, later v1.1 says CANDIDATE | Cannot assert an approved requirements baseline | Open G-01; owner reviews exact text and records version+commit |
| Password + email code versus NIST SP 800-63B-4 | Email OTP isn't the required compliant out-of-band factor | G-02 owner decision; evaluate WebAuthn/TOTP; no AAL2 claim |
| Dark tokens approved, old FR-034 theme presets | UI should not implement an unapproved light toggle | SRS priority change proposed, owner review required |
| Public writing CMS versus conditional nav | Empty collection must not fabricate content | Retain CMS, nav gated by published articles; test sparse state |
| Scientific research stage vs CMS publication status | Misstates paper status if conflated | Distinct fields and trusted publication evidence |
| Published-data cache versus immediate unpublish | Stale cache may leak retracted draft | No shared sensitive cache until safe invalidation or strict read guards proven |
| 18-table schema versus provisional 147 design fields | Design field list is not authoritative SQL | Reconcile exact validation rules after SRS approval |
| Phase03.4 API 29 ops versus UI 41 routes | Not all UI routes are JSON resources | SSR primary, resource routes limited; final endpoint set pending |
| 99.9% availability and 4h/24h recovery candidates | Unmeasured promises create false assurance | Owner approves objectives and restore drilling evidence |
| GitHub PRs #29/#30 merged but main missing files | Intermediate branch merge does not propagate to main | PR #31 catches up source; 03.7 stacked review afterwards |
| 318 planned Phase03 checks / 142 Phase02 cases | Checklists are not test results | None passed by document creation; Phase04 needs evidence |
| Native Penpot board not verified | Imported SVGs/HTML sim do not prove original design tool workflows | G-09 with owner evidence or explicit exception |
| No final provider, budget, region, font/brand | Production infrastructure and content still choices | Deferred with named owner and launch gates |
