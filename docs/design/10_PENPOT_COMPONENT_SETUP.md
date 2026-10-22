# Phase 02.10 — Penpot Native Component & Prototype Setup

**Status:** Instructions only; NO changes made to your Penpot file.
**Companion pack:** `DEVFOLIO_Phase02_10_Component_Library_Pack.zip`, with 8 SVG references, PNGs, registry and local interactive HTML demo.

## Create pages
- `16 — Component Library`: native component masters, variants, documentation.
- `17 — Interaction States & Flows`: linked prototype boards and error/empty states.

## Setup steps
1. Open existing Penpot `DEVFOLIO OS — Public + Admin UI`. Back up existing tokens/components first.
2. Keep previously approved Phase 02.9 `Global` and `Mode/Dark` tokens active; light set inactive for future only.
3. Extract ZIP and import the eight `assets/*.svg` onto suitable reference boards. These are vector illustrations only, **not** native main components or live prototype interactions.
4. Rebuild core native components with Flex/Grid and semantic tokens: shared buttons/badges, form input, nav/drawer, public project/research cards, table row, editor bar and confirmation dialog.
5. Penpot **Create Component** command (Ctrl+K), then create the needed variants; use `Intent`, `Size`, `State` properties on appropriate variants, avoiding unsupported combinations.
6. Keep layer names and hierarchy consistent between variants to preserve overrides when swapping component instances.
7. Add appropriate editable instance slots: label, icon, content, status and media placeholder. Use actual instances across existing PUB and ADM boards.
8. In Prototype mode connect boards using Navigate to, Open/Toggle/Close overlay and Previous Screen actions; test in View mode.
9. Prototype flows: `INT-01 Button Focus`, `INT-02 Field Invalid->Corrected`, `INT-03 Mobile Drawer Open/Close`, `INT-04 Draft->Preview->Publish`, `INT-05 Media Rejection`, `INT-06 Destructive Dialog`, `INT-07 Table Empty/Error`, `INT-08 Session Expiry`.
10. Record the **real** Penpot URL and screenshots only after you create them.

## React handoff (future, no npm now)
- `shadcn/ui` Button/Input/Sheet/AlertDialog/Tabs/Sidebar/Badge etc. with CSS semantic tokens.
- `components.json` must use `"tsx": false` and correct actual JavaScript alias paths after React Router scaffold.
- `react-hook-form`, `zod`, `@hookform/resolvers` for forms; `@tanstack/react-table` for tables; `@tiptap/react` for rich text; `react-dropzone` for chooser, with server-side storage policy.
- Focus/error/keyboard semantics must be tested in running UI; a Penpot prototype cannot guarantee security or ARIA implementation.

## Approval gates
Owner reviews component states and variant scope; Penpot native masters/instances and linked View mode prototypes verified; SRS remains to be reconciled before final Phase 02 sign-off. Brand and font remain open.
