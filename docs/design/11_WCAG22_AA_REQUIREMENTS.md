# Phase 02.11 — WCAG 2.2 AA Design Requirements

**Status:** Planned accessibility requirements, **NOT TESTED / NO COMPLIANCE CLAIM**.
**Scope:** Public and admin; native Penpot prototypes and running browser app still needed.

## High-priority criteria and design decisions
| WCAG 2.2 SC | Level | Proposed acceptance |
|---|---|---|
| 1.1.1 Non-text Content | A | appropriate alt text and genuine figure alternatives |
| 1.3.1 / 1.3.2 | A | semantics + meaningful source/reading order |
| 1.3.5 Identify Input Purpose | AA | correct autocomplete for personal data and login where applicable |
| 1.4.1 Use of Color | A | text statuses in addition to colors |
| 1.4.3 Contrast Minimum | AA | 4.5:1 normal text; 3:1 qualifying large text |
| 1.4.4 Resize Text | AA | 200% text scaling with no loss |
| 1.4.10 Reflow | AA | 320 CSS px equivalent without page-wide two-axis scroll except required 2D content |
| 1.4.11 Non-text Contrast | AA | essential controls and state indicators 3:1 vs adjacent colors |
| 1.4.12 Text Spacing | AA | no clipped content under user spacing override |
| 1.4.13 Hover/Focus Content | AA | tooltip-like content dismissible, hoverable, persistent as appropriate |
| 2.1.1 / 2.1.2 | A | keyboard access and no keyboard trap |
| 2.4.1 / 2.4.3 | A | skip navigation and logical focus order |
| 2.4.7 Focus Visible | AA | obvious keyboard focus indicator |
| 2.4.11 Focus Not Obscured Minimum | AA | focused control not entirely hidden by sticky/floating UI |
| 2.5.3 Label in Name | A | visible label included in accessible name |
| 2.5.7 Dragging Movements | AA | non-drag pointer alternative for reorder/upload |
| 2.5.8 Target Size Minimum | AA | 24×24 CSS px or documented criterion exceptions/spacing |
| 3.3.1/2/3 | A/AA | labeled fields, error identification and actionable correction |
| 3.3.7 Redundant Entry | A | avoid needless repeated entry across multi-step forms |
| 3.3.8 Accessible Authentication Minimum | AA | password manager/autofill/paste, including OTP; no mandatory memorization/transcription barrier |
| 4.1.2 / 4.1.3 | A/AA | programmatic name-role-value and status announcements |

**Critical clarification:** 44px is our *preferred* common touch-control size, NOT the numerical WCAG 2.2 AA requirement (24px plus exceptions). Focus Not Obscured **Minimum** (2.4.11) is AA; the stricter Enhanced (2.4.12) and Focus Appearance (2.4.13) are AAA. Aim high without mislabeling the conformance level.

### Browser/manual checks to complete later
Keyboard tab/shift-tab and escape/dialog return; 320/390/768/1440 viewports; 200% text resizing; 400% browser zoom on 1280px; Windows screen reader (e.g. NVDA) + Chrome/Firefox; OTP paste/password manager; error summary and live status; reduced motion; alt text/code/chart alternatives; 24px targets; screen reader table headers.

Automated axe-core/Playwright scans belong in implementation/QA phases as useful support, not a replacement for manual verification. No test in this document is recorded as PASS.

Official references:
- https://www.w3.org/TR/WCAG22/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum
- https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html
