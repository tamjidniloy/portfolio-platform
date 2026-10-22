# DEVFOLIO OS — Phase 02.9 Design System v0.1

**Status:** OWNER APPROVED dark tokens, scale, radii, principles and component direction at DESIGN-SPECIFICATION LEVEL on 2026-10-23 (ADR-DS-001). Exact font, brand, native Penpot implementation, accessibility QA and SRS reconciliation remain OPEN.
**Date:** 2026-10-23 (Asia/Dhaka)
**Dependencies:** ADR-UI-001, ADR-IA-001, ADR-WF-001/002/003, ADR-UX-002. Approved Phase 01 SRS still missing on GitHub `main`; `docs/phase01/SRS_RECONCILIATION.md` remains OPEN.
**Public brand/name:** OPEN. **Exact font:** OPEN.

## Principles
- Minimal editorial layout + engineering/research evidence, not decorative excess.
- Accessible, readable, truthful and responsive public portfolio plus a task-efficient private CMS.
- Primitive values -> semantic tokens -> reusable component variants. Components consume semantic names, never hard-coded hex.
- Dark-first; optional light-mode candidate values are prepared but a production toggle is NOT approved.

## Approved dark semantic colors (HEX approved at specification level; light palette is future-only)
| Role | Dark | Light candidate |
|---|---|---|
| background | #10151D | #F8FAFC |
| foreground | #F1F5F9 | #182331 |
| card | #17212D | #FFFFFF |
| popover / elevated | #213042 | #FFFFFF |
| primary (teal) | #70D9C3 | #116B61 |
| primary-foreground | #10151D | #FFFFFF |
| muted-foreground | #B0BECC | #475569 |
| secondary surface | #243141 | #E9EFF5 |
| link (blue) | #9CC0FF | #1D4ED8 |
| decorative border | #46586B | #64748B |
| critical input boundary | #788BA2 | #64748B |
| focus ring | #70D9C3 | #116B61 |
| destructive/error | #FDA4AF | #A3172D |
| success | #86EFAC | #11663A |
| warning | #FCD34D | #8D4D07 |

Contrast math selected examples: dark foreground/background 16.71:1; muted/background 9.66:1; primary foreground/primary 10.81:1; link/background 9.94:1. Light foreground/background 15.16:1; primary foreground/primary 6.36:1; link/background 6.41:1. Audit real layered and interactive states separately. See companion pack `09_CONTRAST_ACCESSIBILITY_AUDIT.md`.

## Type scale (font family unresolved)
| Role | Target size | Line height | Weight idea |
|---|---|---|---|
| Display | desktop 64px / mobile ~40px | 1.04–1.12 | 600–650 |
| H1 | desktop 52px / mobile ~36px | 1.10–1.16 | 600–650 |
| H2 | desktop 36px / mobile ~28px | 1.18–1.28 | 600 |
| H3 | 24px / mobile 22px | 1.28 | 600 |
| Lead | 18px / mobile 17px | 1.6 | 400 |
| Body | 16px | 1.65 | 400 |
| Small | 14px | 1.55 | 400 |
| Caption | 12px | 1.45 | 500 |

Candidate family comparison in later step: Geist vs Inter (neither selected). Use system sans-serif placeholder and subtle mono metadata until owner chooses. Long-form max reading width ~72ch.

## Spacing, layout, radius and motion
- Base 4px spacing: 4/8/12/16/20/24/32/40/48/64/80/96.
- Corner radii: 6/10/14/20px, pill 999px.
- Public max content width ~1248px; desktop 1440 gutter 96px, tablet 768 gutter 42px, mobile 390 gutter 20px.
- Admin sidebar reference width ~240px desktop; mobile accessible drawer.
- Control min height **44px preferred**; verify actual WCAG target-size criteria and spacing.
- Design QA at 320,390,768,1024,1440,1920 CSS px; all components must support zoom/reflow.
- Motion (optional): fast 120ms, normal 180ms, slow 240ms. Honor prefers-reduced-motion; no compulsory intro/scroll hijacking.
- Focus-visible: visible 2px solid focus ring + 3px offset; verify actual contrast against adjacent surfaces.

## Components, structure and tokens
16 families are specified in `09_COMPONENT_CATALOG.md`. Do not introduce an entire second component design framework on top of shadcn/ui. Need states: default, hover, focus, active, disabled, loading, empty, invalid, saved, publish confirm, publish blocked, archived, session-expired. Scientific research stage must remain separate from CMS status.

## JavaScript / React / Tailwind / shadcn mapping (future Phase 04+)
- React Router Framework Mode with Express integration selected by architecture phase.
- Tailwind v4 `@theme inline { --color-background: var(--background); ... }`; use `bg-background text-foreground` and other semantic classes.
- shadcn/ui JavaScript requires `"tsx":false` in `components.json`, paths adapted to real React Router scaffold.
- Planned packages: Radix/shadcn components, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `@tanstack/react-table`, `@tiptap/react`, `react-dropzone`. None installed now.
- Frontend form validation improves UX; backend schema validation, authorization and file checks remain mandatory.
- Companion ZIP in project conversation supplies full CSS, Penpot token JSON, JS sample and editable SVG specimens; these are NOT committed application source files.

## Owner approval gate
Review proposed palette values, typography scale, component variants/states, Penpot token import, contrast test outputs, mobile reflow and React mapping. Do not sign off exact tokens or entire Phase 02 until approved SRS and native Penpot prototypes are verified. Keep public brand/font open.
