# Phase 02.11 — Keyboard, Focus, Error and Motion Contract

**Status:** Design specification ONLY; runtime keyboard/ARIA behavior NOT verified.

## Global
- Visible-on-focus skip-to-main; meaningful header/nav/main/footer landmarks.
- Logical focus order follows content/DOM order when grid collapses to one column.
- Focus-visible state on links, icon-only buttons, tabs, data-table headers and editor controls.
- No traps: modal/drawer focus enters and returns to its trigger; Escape/cancel closes as appropriate without unexpected publication/deletion.
- Status communicates via visible words and appropriate programmatic announcements, not color alone.
- Maintain actionable controls under sticky header/action bars (2.4.11 AA: focused element not entirely hidden).
- Tooltip/menu close and hover persistence follows WCAG rules; reduced-motion avoids decorative movement.

## Public
- Mobile menu Enter/Space opens, Escape/cancel closes, active location conveyed.
- Cards use real links to published items, no nested conflicting hit areas.
- Contact form labels persist; invalid fields show useful error messages, focus appropriate summary, preserve entered values.
- Code and research figures/tables allow local 2D scroll only where necessary, with captions and alternatives.

## Admin
- Login/password manager, browser autofill and OTP code paste permitted; no forced retyping transcription.
- Admin index tables have accessible sort states and a mobile card view with all important actions.
- Forms show saving/saved/failed accurately only after server confirmation; preserve draft on validation/network failure.
- Dialogs require distinct Confirm/Cancel; sessions expire safely with no private cached content exposure.
- Upload drag alternative: native keyboard-accessible Choose File button; validation error and retry.
- Research scientific stage remains separate from CMS draft/published/archived; published flags must be confirmed by backend.

**Test handoff:** User reviews prototype annotations in Phase 02.11; implementation Phase 04+ uses React/JavaScript, shadcn/Radix, RHF/Zod, TanStack Table, Tiptap and react-dropzone appropriately; Phase 10 verifies actual browser and screen-reader behavior.
