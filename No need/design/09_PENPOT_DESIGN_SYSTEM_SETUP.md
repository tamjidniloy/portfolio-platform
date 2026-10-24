# Phase 02.9 — Penpot Token and Component Setup

**Status:** INSTRUCTIONS ONLY; Penpot account/file has NOT been edited by ChatGPT.
**Companion ZIP:** `DEVFOLIO_Phase02_09_Design_System_Pack.zip` in project conversation.

1. Open `DEVFOLIO OS — Public + Admin UI` in Penpot. Create `14 — Design System Foundations` and `15 — Component Library` pages.
2. **Back up existing token sets** to avoid destructive replacement during import.
3. In Penpot **Tokens tab → Tools → Import**, choose the pack's `tokens/penpot-token-sets.json`. This file uses Penpot's documented single-JSON first-level sets: `Global`, `Mode/Dark`, `Mode/Light`.
4. Activate `Global` and `Mode/Dark`, leaving light inactive until a separate review. Inspect recognized tokens/any warnings. Exact values are candidates, not approved.
5. Import `assets/Design_System_Dark.svg` as an editable style reference, NOT a native responsive component library. Compare its `.png` preview.
6. Create reusable native components and states: buttons, badges, labels/inputs, project/research cards, breadcrumbs, admin sidebar, table row, upload tile, publish dialog, error summary, action bar, toast and empty state.
7. Apply tokens rather than hard-coded color fills, use Penpot Flex/Grid layout and variants. Create responsive boards at 1440/768/390 and stress-test 320 widths. Verify text resizing and high-contrast focus.
8. Test keyboard focus, mobile menu, modal restoration, invalid input, warning/success and reduced motion in prototypes; note that working behavior is only implemented in later React phases.
9. Add real Penpot URLs and owner approvals to review docs after the designs exist.

## Token mapping
- Penpot `color.background` -> CSS `--background` -> Tailwind `bg-background`
- Penpot `color.foreground` -> CSS `--foreground` -> Tailwind `text-foreground`
- Penpot `color.primary` -> CSS `--primary` -> Tailwind `bg-primary`
- Penpot `color.primary-foreground` -> CSS `--primary-foreground` -> Tailwind `text-primary-foreground`
- Penpot `color.muted-foreground` -> CSS `--muted-foreground` -> Tailwind `text-muted-foreground`
- Penpot `color.ring` -> CSS `--ring` -> Tailwind `ring-ring`

JavaScript scaffold example in ZIP demonstrates `components.json` with `"tsx":false` and JSX using semantic Tailwind classes. Adjust paths to the actual React Router scaffold in Phase 04. No npm installs now.

**Open:** Public brand and exact font, final token HEX owner approval, SRS reconciliation, working Penpot prototypes and implementation.
