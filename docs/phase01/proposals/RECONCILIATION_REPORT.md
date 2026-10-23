# Historical SRS ↔ Approved Phase 02 Design — Reconciliation Report

**State:** REVIEW COMPLETE AS PROPOSAL; SRS APPROVAL NOT GRANTED.
**Source:** 2026-10-23 GitHub `main`: historical `docs/phase01/draft/docs/*`, Phase 02 ADRs and final handoff.

## Findings at a glance
- **28** documented differences, hardening needs and release gates.
- **1 proposed explicit priority shift:** FR-034 P1 → P2 (theme selection postponed; light future-ready only).
- Stable IDs: FR-001..052, NFR-001..024 retained; no user stories or requirements silently dropped.
- **18** original requirement IDs lack a direct acceptance-test mapping; 18 proposed test cases remain NOT_RUN.
- Outstanding major decisions: final brand and font, approved requirements baseline, retention, media limits/provider, privacy and native Penpot/QA.

## Detailed resolution proposals

| Finding | Priority | Legacy issue | Proposed rule | Decision source | Remaining action |
|---|---|---|---|---|---|
| R-01 | BLOCKER | Not approved baseline | Keep historical SRS in /draft; v1.1 proposal separate. Owner must approve canonical baseline. | None | Owner-approved revision/date/commit |
| R-02 | HIGH | Light mode proposed default in old decision | No light mode or theme toggle in Release 1; light palette future-ready only; candidate change FR-034 P1 to P2. | ADR-DS-001,ADR-DS-002 | Owner approves scope change |
| R-03 | HIGH | brand_name required but no final public brand | Keep final public brand/name undecided; block actual production public identity copy. | ADR-UI-001 | Owner brand decision |
| R-04 | MEDIUM | Exact typeface not set | Dark editorial typography scale adopted; exact font remains open; no invented font. | ADR-DS-001 | Owner font selection |
| R-05 | MEDIUM | Writing P0 vs optional navigation | Keep article CMS/list/detail capability P0, but show Writing nav only when genuine published articles exist. | ADR-IA-001 | Owner confirms conditional discovery |
| R-06 | MEDIUM | Standalone public routes vs compact nav | Keep /experience,/education,/skills,/achievements accessible via About/footer but not primary nav. | ADR-IA-001 | Confirm canonical route aliases |
| R-07 | HIGH | Publication vs research stage ambiguity | Publications grouped within Research; research scientific stage separate from CMS publication state. | ADR-IA-001,ADR-WF-003 | Review status vocabularies |
| R-08 | CRITICAL | Draft visibility language broad | Explicitly deny drafts via SSR/loaders/APIs/sitemap/search; private preview authorized, no-store/noindex. | ADR-UX-002,ADR-IX-001 | Security threat modeling in Phase 03 |
| R-09 | HIGH | Client-only toasts vs backend truth | Save/publish/unpublish/restore never claim confirmed success before server acknowledgment. | ADR-IX-001 | Transaction semantics TBD |
| R-10 | HIGH | Message persisted vs email delivered | Separate contact accepted/recorded from notification success; preserve form on failure. | ADR-IX-001 | Retention/delivery rules TBD |
| R-11 | HIGH | Media exact size/types unapproved | Retain images/PDF intent; MIME/signature/size/quotas and retention remain phase03 owner decisions. | ADR-UX-002 | Upload policy approval |
| R-12 | HIGH | Old field ranges seen as final schema | Historical draft field dictionary + 147-field form registry are proposals, not approved database/API contracts. | ADR-UX-002 | Owner validation signoff |
| R-13 | LOW | Filters P1 vs Phase02 screens showing filters | Maintain P1 status; design screenshot alone does not elevate priority. | ADR-IA-001,ADR-IX-001 | Owner can reprioritize |
| R-14 | MEDIUM | Admin navigation reorder vs IA restrictions | Allowed predefined routes/IDs only; section ordering P1 and constrained. | ADR-IA-001 | Routes/identifiers finalized later |
| R-15 | CRITICAL | Login flow needs full threat controls | Password + one-use expiring email challenge; rate limits, sessions, recovery, CSRF and reauth remain security architecture tasks. | ADR-WF-003,ADR-IX-001 | Email delivery and recovery policy |
| R-16 | CRITICAL | Accessibility mistaken for tested | WCAG 2.2 AA is requirement target; design approved only, zero conformance claims; 52+42+48 planned cases remain NOT_RUN. | ADR-A11Y-001 | Schedule evidence-based QA |
| R-17 | MEDIUM | Unspecific breakpoints | Use 320,360,390,768,1024,1440,1920 as test widths; not literal CSS breakpoint mandates. | ADR-A11Y-001 | No additional owner decision |
| R-18 | HIGH | Core Web Vitals targets confused with achieved | Keep LCP <=2.5s, INP <=200ms, CLS <=0.1 as measured release targets; not achieved today. | ADR-DS-001 | Performance evidence later |
| R-19 | MEDIUM | Resume may be absent | Show download only for approved public PDF and enabled flag; otherwise hide without broken links. | ADR-IA-001 | Owner content availability |
| R-20 | LOW | Optional future features shown as main scope | Preserve FR-016 P1; FR-017/036/037 P2; no speculative UI implies scope. | ADR-IA-001 | No decision needed |
| R-21 | HIGH | Scope includes broad screen inventory | Hi-fi reference 18 screen types are examples; final template/native Penpot coverage and real screens need later evidence. | ADR-WF-002/003 | Native board URL and coverage |
| R-22 | CRITICAL | Retention policies not approved | Require explicit retention/erase, contact notification and audit-log privacy policies before launch. | ADR-UX-002 | Owner/privacy policy |
| R-23 | MEDIUM | Domain, analytics, hosting and email provider open | Provider/domain/budget and opt-in analytics finalized in architecture; no invented vendors. | None | Owner deployment/provider decisions |
| R-24 | MEDIUM | No future commitments implicit | Visitor registration, payments, microservices, scheduled publishing, external auto-sync, multilingual authoring outside Release 1. | ADR-IA-001 | Owner accepts exclusions |
| R-25 | HIGH | 18 historical requirement IDs lack explicit tests | Provide 18 proposed new tests, owner review and automation plan; original 43 cases remain NOT_RUN. | ADR-A11Y-001 | Approve test coverage revision |
| R-26 | HIGH | Featured content might show unpublished | Feature only published records with verified live references; omit sparse sections rather than fabricate. | ADR-WF-001 | No additional owner decision |
| R-27 | MEDIUM | Framework version and technical details unverified | Architecture candidate React Router Framework SSR + Node/Express + PostgreSQL modular monolith; lock stack/package versions in Phase03 ADR. | ADR-DS-001 | ADR approval before lock |
| R-28 | HIGH | Canonical/indexing rules partial | Use published-only sitemap/canonical URLs, redirects for prior published slugs, 404 for never-published/draft. | ADR-IA-001 | SEO edge cases Phase03 |

## Source precedence and gates
1. Original v1.0 remains a draft. The candidate SRS is fully written but unapproved.
2. Phase 02 design ADR approvals are scoped; they are not server functionality or accessibility test evidence.
3. Phase 03 may plan architecture, but must not lock contracts before owner SRS signoff.
4. Do not use 147 provisional CMS form fields as a final API/DB schema.
5. No native Penpot test, WCAG AA conformance or secure deployment has been verified.
