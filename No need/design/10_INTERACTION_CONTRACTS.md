# Phase 02.10 — Component Interactive States & Accessibility Contract

**Status:** PROPOSED — not a functioning production UI.
**Prerequisite:** ADR-DS-001 exact dark palette, typography scale and design foundation approved.
**Source requirement caveat:** Authoritative Phase 01 SRS still not present on GitHub main.

## Three different meanings of a state
1. **Visual variants:** default, hover, focus-visible, pressed, selected, disabled, invalid. These can be designed as native Penpot variants.
2. **Interactive prototype transitions:** menu open/close, form valid/invalid, dialog cancel/confirm, upload error/success. Penpot prototype connections/overlays demonstrate behavior but not real data.
3. **Server-owned states:** authenticated, authorized, draft saved, asset verified, published, restored, deleted. Only real backend responses in later phases can establish these states.

## State transition contracts
| Pattern | Transition | Mandatory behavior |
|---|---|---|
| Button | idle → hover/focus → pressed → idle | Enter/Space activation; pending disables duplicate action; text/icon feedback |
| Text field | untouched → editing → blurred → valid/invalid | Visible label, help, associated error, preserve value |
| Modal | closed → open → confirm/cancel → closed | Focus enters modal, controlled Escape/cancel, focus returns to trigger |
| Combobox | closed → open → option selected → closed | Arrow/Enter/Escape per combobox keyboard pattern |
| Tabs | selected A → selected B | Arrows switch selection per selected tab UX, correct focus/aria relations |
| Mobile drawer | closed → open → close/navigate → closed | Escape/backdrop and trigger focus restoration |
| Admin table | loading → records/empty/filter-no-results/error | Separate empty and no-filter-match states, accessible sortable headers |
| Media | idle → uploading → verified/rejected | Keyboard chooser; upload failure preserves editor, server checks type/size/signature |
| Publishing | unsaved → saving → saved draft → private preview → validate → confirm → server success/failure | Explicit publish state, errors and retries, no false success |
| Research | scientific stage independent of CMS publishing | Truthful stage and published visibility, no fake formal publication |
| Messages | unread → read → archived/deleted | Actual visitor message remains immutable, private |
| Session | active → expired → reauthenticate | Never leak private content from protected screens |

## Design reviews
- Contrast pairs, focus ring adjacency, WCAG 2.2 AA contrast in full context, status not color-only.
- Keyboard-only walkthrough of all interactive controls.
- Native Penpot sample board at 390px and actual reflow to 320px; 200% zoom test during implementation.
- Check empty state, error summary, long titles, motion reduction, destructive-action confirmation and mobile access to editor action buttons.
- Use real text for statuses; avoid inaccessible icon-only placeholders.

## Relevant documentation
- Penpot Components & Variants: https://help.penpot.app/user-guide/design-systems/components/ and https://help.penpot.app/user-guide/design-systems/variants/
- Penpot Prototyping: https://help.penpot.app/user-guide/prototyping-testing/prototyping/
- WAI-ARIA APG Keyboard: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- shadcn JavaScript opt-out: https://ui.shadcn.com/docs/javascript
