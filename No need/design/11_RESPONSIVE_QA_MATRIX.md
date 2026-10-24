# Phase 02.11 — QA Matrix and Approval Gates

**Status:** SPECIFICATION APPROVED (ADR-A11Y-001); all 52 practical QA cases remain NOT RUN. No WCAG claim.
**Companion artifacts:** `DEVFOLIO_Phase02_11_Responsive_A11y_Pack.zip` includes 52 planned cases in CSV/JSON, eight editable SVG references and an offline responsive lab. Demo is not actual application.

## Review matrix
| Scenario | Design test widths | Implementation checks | Expected |
|---|---|---|---|
| Home/Projects/Research | 320,390,768,1024,1440,1920 | reflow, long titles, conditional content | no lost work/contact paths |
| Case-study/article/figures | 320,390,768,1440 | 2D exceptions/local scroll, figures/alt | reading and diagrams remain useful |
| Contact | 320,390,1440 | error summary, text zoom, live confirmation | accessible corrections and truthful status |
| Admin dashboard/table | 320,390,768,1440 | record-card alternative, keyboard sorts | no hidden status or actions |
| Admin editor/media | 320,390,768,1440 | fixed bar, dialog focus, upload fallback | safe responsive field groups |
| Login/OTP | 320,390,1440 | autocomplete/password manager, paste, recovery | accessible authentication |
| Whole UI | 1280 @ 400% zoom; 200% text | browser zoom + screen reader | proper reflow and accessible controls |
| Component states | representative widths | focus visibility, target size, contrast, reduced motion | WCAG-oriented interactions |

## Owner review checklist
- [ ] Responsive layout behavior and mobile-to-desktop hierarchy approved.
- [ ] Native Penpot Flex/Grid screens actually created and inspected.
- [ ] Error/drawer/OTP/publishing prototype connections tested.
- [ ] 320px reflow and 200% text/400% zoom tests planned and later executed in browser; do NOT mark as passed based on wireframes.
- [ ] Keyboard, focus, label, input/error feedback and reduced-motion rules checked.
- [ ] 24px AA targets with exceptions understood; 44px common-control design preference documented.
- [ ] Research diagram/table-local scroll and alternatives reviewed.
- [ ] Contrast on actual surfaces and states audited later.
- [ ] Owner approval of Phase 02.11 recorded with version/date and limitations.
- [ ] **Authoritative owner-approved Phase 01 SRS synced to GitHub and reconciled before final Phase 02 sign-off (OUTSTANDING).**
- [ ] Final public brand and exact font still open; light theme future-ready only.

## Sign-off distinction
Phase 02.11 approval (if granted later) may approve the **responsive and accessibility specification**, but cannot prove the software meets WCAG 2.2 AA until an implemented app is tested with automated checks plus manual keyboard/screen-reader review.
