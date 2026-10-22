# Phase 02.9 — Accessible Color & Interaction Review

**Status:** PROPOSED TOKENS / SELECTED COMPUTED COLOR PAIRS ONLY (not a WCAG certification)

## Standards and thresholds
- WCAG 2.2 AA normal text contrast: at least 4.5:1.
- Large-scale text (per WCAG definition) and applicable meaningful non-text component indicators: at least 3:1.
- Check real UI adjacency, imagery, transparency, focus rings, error badges, inactive controls, hover/selected states, not just two isolated hex codes.
- Reflow at 320 CSS pixel equivalent widths with documented exceptions; zoom 200% text; visible keyboard focus, clear accessible names and error summaries.
- 44px touch controls preferred by design; WCAG 2.2 AA target size has its own minimum and exceptions.

## Selected candidate color-pair math (WCAG relative luminance)
| Mode | Pair | Ratio | Threshold | Check |
|---|---|---:|---:|---|
| Dark | #F1F5F9 on #10151D body | 16.71:1 | 4.5 | Pass |
| Dark | #B0BECC on #10151D muted text | 9.66:1 | 4.5 | Pass |
| Dark | #10151D on #70D9C3 CTA | 10.81:1 | 4.5 | Pass |
| Dark | #9CC0FF on #10151D link | 9.94:1 | 4.5 | Pass |
| Dark | #788BA2 input border vs #213042 elevated | 3.84:1 | 3.0 | Pass |
| Light candidate | #182331 on #F8FAFC body | 15.16:1 | 4.5 | Pass |
| Light candidate | #FFFFFF on #116B61 CTA | 6.36:1 | 4.5 | Pass |
| Light candidate | #1D4ED8 on #F8FAFC link | 6.41:1 | 4.5 | Pass |

## Pending verification
- Test all actual Penpot surfaces and colored badges, combinations, dark/light contrast in context.
- Visual focus must stand out against BOTH control and adjacent background.
- Error text must be announced and identified beyond color; validation field labels present.
- Mobile navigation and admin dialog support Escape, focus restoration and keyboard order.
- No forced animation, provide prefers-reduced-motion; no compulsory intro.
- Confirm contrast values with independent checker after exact values are finalized.
- Screen reader, 320px reflow and zoom checks cannot be validated merely from static SVGs.

Companion ZIP includes a machine-readable contrast audit and full candidate token stylesheet.
