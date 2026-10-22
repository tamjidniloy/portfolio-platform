# DEVFOLIO OS — Phase 02.12 Interaction Patterns and Microinteractions

**Status:** PROPOSED for owner approval at design-specification level, not implemented.
**Date:** 2026-10-23 (Asia/Dhaka)
**Dependencies:** ADR-UI-001 / ADR-IA-001 / ADR-WF-001,002,003 / ADR-UX-002 / ADR-DS-001,002 / ADR-A11Y-001.
**Still open:** Authoritative approved Phase 01 SRS missing from GitHub main; exact public brand/name and font family. Light palette future-ready only. Native Penpot work and tests NOT verified.
**Companion ZIP:** DEVFOLIO_Phase02_12_Interactions_Pack.zip from project conversation (editable SVGs, interaction registry JSON/CSV, design docs, offline simulation, test matrix).

## Principles
1. **Evidence-first:** Animation never masks missing real projects, research stages or publication evidence.
2. **Clarity > spectacle:** Motion confirms hierarchy and cause/effect; no parallax/scroll hijacking, blocking introduction or autoplay decoration.
3. **Server truth:** Do not label a draft 'Saved', upload 'Verified', or content 'Published' until authoritative response confirms it.
4. **Accessible by default:** States are text-labeled; focus visible; keyboard and reduced-motion alternatives; error text close to input; status announcements without gratuitous focus jumps.
5. **Persistence over polish:** Preserve entered data through recoverable validation/network errors, session-expiry recovery consistent with privacy policy; never expose secrets or PII in local demos/logs.
6. **Desktop/mobile parity:** Same fundamental action/result; drawers, tables and overlays adapt to 320/390 through desktop.

## Interaction contracts
| ID | Pattern | Trigger | Initial → final state | Alternative/error path | Focus & accessibility | Surfaces |
|---|---|---|---|---|---|---|
| IP-01 | Public nav | Select page link | current route → new page | 404 for missing/unpublished detail | current nav indicates page; heading focus rules; skip link | Header, footer |
| IP-02 | Mobile drawer | Open menu | closed → open → route/closed | Escape/backdrop/cancel | return focus to trigger on dismissal; no page scroll trap | Public & admin |
| IP-03 | Card affordance | Hover/focus card link | resting → emphasized | unavailable external link hidden | no hover-only content; meaningful text link | Projects, Research, Writing |
| IP-04 | Tabs/filters | Choose category | all → filtered | no results vs no content distinct | active label and count; focus remains predictable | Collections, admin |
| IP-05 | Accordion | Activate trigger | collapsed → expanded | nested long content | aria-expanded semantics; no content lost in reduced motion | FAQ/technical sections |
| IP-06 | Form error | Submit incomplete | editing → invalid summary | correction → valid | associate labels/errors, focus summary appropriately | Contact/admin |
| IP-07 | Contact request | Submit | idle → sending → accepted | rate limited, failed, retry | status announced, keep input on failure, accepted ≠ email delivered | Contact |
| IP-08 | Admin draft save | Save Draft | dirty → saving → saved | conflict/failure; preserve local changes | inline persistent status; no success before server response | CMS editor |
| IP-09 | Private preview | Preview | editor → auth-only preview | expired session/invalid link | noindex/no-store, back to edited item | CMS editor |
| IP-10 | Publish | Publish intent | draft → validated → confirm → published | invalid fields, cancel, server error | explicit modal, safe default focus, status text | CMS editor |
| IP-11 | Unpublish/delete | Destructive click | confirm → server transition | cancel/conflict/error | destructive details, safe initial focus, no silent deletion | CMS/media |
| IP-12 | Restore revision | Select revision | compare → draft restoration → optional publish | incompatible old schema, stale version | label whether restoration changes live data | CMS history |
| IP-13 | Media upload | Choose/drop file | idle → uploading → validated media | rejected size/type, failed upload, retry | keyboard file picker, progress text and asset alt info | Media library |
| IP-14 | Toast/notice | Background result | none → informational feedback | persistent error instead of toast-only | polite status for routine result; urgent alert sparingly | Both |
| IP-15 | Collection loading | Navigate/filter | stable layout → real records | skeleton/empty/filter-empty/network error | do not announce every skeleton; final results conveyed | Collections/tables |
| IP-16 | Authentication | Login / OTP | credentials → challenge → session | invalid, expired, rate limited; recovery | paste/autofill/password managers; no account enumeration | Admin auth |
| IP-17 | Session expiration | Secured action | active → expired → reauth | unsaved edits/resume safely | never disclose data on locked/public screens | Admin |
| IP-18 | Search/filter reset | Clear | filtered → all | genuinely no content | clear filters & results status; no jump to page top | Lists/tables |
| IP-19 | Status badge | Record changes | draft/published etc. | stage/status mismatch | visible text alongside color; research-stage separate | Public/admin |
| IP-20 | Page errors | Missing/server error | route → 404/500 | try navigation or retry safe operation | actual HTTP status later, clear recovery action | Both |

## Component timing / motion policy
These values are **proposed defaults**, not approved SLA thresholds:
- Short feedback: 120ms ease-out, e.g. button highlight/focus embellishment.
- Regular disclosure: 180ms ease-out, e.g. accordion/nav drawer.
- Context transition: up to 240ms ease-out, e.g. nonessential dialog fade.
- Keep transformation subtle (~4–8px at most where needed) and avoid scale jumps, background drift, parallax and perpetual shimmer.
- Loading depends on actual latency; don't fake progress percentages or delay real content just to play animation. Stable skeletons may appear where appropriate; use nonanimated skeleton under reduced motion.
- `prefers-reduced-motion: reduce`: remove nonessential movement and keep all status meaning. Animations must not be required to understand new state.
- To avoid false certainty, timeout/retry thresholds, polling frequency and optimistic updates require later implementation decisions. Server-confirmed publication is mandatory.

## Color & contrast
Reuse approved dark semantic colors from ADR-DS-001. Success = text + symbol if useful, failure = message + action, warning = clear consequence and Cancel. Do not communicate publication, scientific stage, or validation solely by color.

## URL / publication rules
- Unpublished detail receives actual 404 from runtime (design spec now).
- Slug redirect only to published canonical destination.
- Private preview auth-only and never in public sitemap/search.
- Article/project/research links appear only with valid approved published targets.
- Public contact success means server accepted or persisted as applicable; do not claim email was delivered unless verified.

## Acceptance criteria
All IP-01…IP-20 have default/active/disabled/error/empty states where relevant; keyboard/focus/error return guidance; mobile and reduced-motion variants; correct route/data ownership. Penpot review board and 42 planned QA cases provided. None are claimed tested or implemented.
