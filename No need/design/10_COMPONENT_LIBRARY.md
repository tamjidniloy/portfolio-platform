# Phase 02.10 — Reusable UI Component Library v0.1

**Status:** APPROVED AT DESIGN-SPECIFICATION LEVEL on 2026-10-23 (ADR-DS-002); no native Penpot components or accessibility tests have been verified.
**Date:** 2026-10-23 (Asia/Dhaka)
**Approved foundation:** ADR-DS-001 — exact dark semantic HEX palette, type scale, spacing, radii and accessibility principles approved at specification level.
**Previous approvals:** ADR-UI-001, ADR-IA-001, ADR-WF-001/002/003, ADR-UX-002.
**Open:** Authoritative approved Phase 01 SRS not synchronized to `main`; public brand and exact font unresolved. Light tokens stay FUTURE-READY ONLY, with no Release 1 theme toggle approved.

## Objectives
One reusable library for the public professional portfolio and private admin CMS. Compose from semantic color/spacing/type tokens; share primitives but avoid forcing public editorial layouts to look like the CMS. Distinguish reusable **visual variants**, **UI interactions**, and **server-owned publication/auth/data states**.

## Component inventory (24 families)
| ID | Scope | Variant dimensions | States | Implementation candidate (future Phase 04+) |
|---|---|---|---|---|
| shared/button | Shared | intent, size | default, hover, pressed, focus, disabled, loading | shadcn/ui Button |
| shared/icon-button | Shared | intent, size | hover, focus, disabled | Button + lucide-react |
| shared/link | Shared | inline, nav, external | default, hover, current, focus, visited | React Router Link / anchor |
| shared/badge | Shared | neutral, success, warning, error, draft, published, scientific-stage | default | shadcn/ui Badge |
| shared/tabs | Shared | compact, default | active, hover, focus, disabled | shadcn/ui Tabs |
| shared/accordion | Shared | collapsed, expanded | open, closed, focus | shadcn/ui Accordion |
| shared/input | Shared | text, email, URL, slug, password | empty, filled, focus, invalid, disabled, read-only | shadcn/ui Input |
| shared/textarea | Shared | short, long | empty, filled, focus, invalid, disabled | shadcn/ui Textarea |
| admin/select | Admin | category, status | closed, open, selected, invalid, disabled | shadcn/ui Select / native select |
| admin/combobox-tags | Admin | technologies, tags, collaborators | open, closed, selected, empty | shadcn Popover + Command |
| admin/checkbox-switch | Admin | visibility, featured, consent | checked, unchecked, focus, disabled | shadcn Checkbox / Switch |
| admin/date-field | Admin | start, end, published | empty, valid, invalid | Native date / Calendar |
| admin/editor-toolbar | Admin | article, case study, research | selected, disabled, invalid | Tiptap |
| admin/media-picker | Admin | image, PDF, multi | idle, dragging, uploading, verified, rejected | react-dropzone + server policy |
| public/project-card | Public | compact, featured | hover, focus, unavailable | shadcn Card / Link |
| public/research-card | Public | row, grid | hover, focus, empty | Card + genuine scientific status |
| shared/breadcrumb | Shared | 2, 3, 4 levels | current, hover, focus | shadcn Breadcrumb |
| public/navigation | Public | desktop, mobile | closed, open, current, focus | React Router + shadcn Sheet |
| admin/sidebar | Admin | full, compact, mobile | active, open, closed | shadcn Sidebar / Sheet |
| admin/data-table | Admin | dense, standard, mobile-card | loading, sorted, filtered, empty, failed | TanStack Table |
| admin/alert-dialog | Admin | publish, unpublish, delete, restore | open, closed, pending, failed | shadcn AlertDialog |
| admin/editor-action-bar | Admin | desktop, mobile | unsaved, saving, draft-saved, preview, blocked, publishing, published, conflict | shadcn Button + Badge |
| shared/feedback | Shared | inline, toast, persistent alert | success, warning, error | shadcn Alert / sonner if appropriate |
| shared/collection-states | Shared | table, grid, list | loading, empty, no-filter-results, error | shadcn Skeleton / Empty |

## Naming
Penpot main component naming: `shared/button/primary/default`, `shared/input/error`, `public/card/research/row`, `admin/table/row/selected`, `admin/editor/action-bar/draft`. Variant properties: `Intent`, `Size`, `State` only as needed. Do not create the entire Cartesian product of intent × size × state when combinations are invalid or unused.

## Design tokens
Use ADR-DS-001 approved dark values, including `#10151D` background, `#17212D` card, `#70D9C3` teal primary, `#9CC0FF` blue links and `#F1F5F9` body text. Apply design via semantic aliases and Penpot tokens rather than hardcoded color in each instance. Future light token candidates remain inactive.

## Component behavior and constraints
- Every actionable control is keyboard-accessible with visible focus. Keep focus and selection distinct.
- Button and link semantics are not interchangeable. Do not implement navigation through a generic div click.
- Important error messages persist inline; a toast is supplementary only.
- Status labels use visible words, not color alone.
- Modal dialogs retain focus inside while open and restore focus when dismissed, with explicit destructive confirmation.
- Admin tables offer a mobile record-card alternative. Long code/figures have controlled overflow.
- Public cards contain published records only; private previews are authenticated and not indexed.
- Scientific research status is separate from CMS draft/published/archived.
- Save/Publish/Upload success means **server-confirmed**, never client-only optimistic messaging.
- Keep real identities, secrets, message PII and invented achievements out of specimens.

## Responsive & accessibility targets
Desktop references 1440, tablet 768 and mobile 390, plus 320 CSS px reflow and zoom checks. Prefer ~44px control height; actual WCAG target-size evaluation follows WCAG 2.2 criteria/exceptions. Honor reduced motion. Use visible labels, error summaries, ARIA states and WAI-ARIA keyboard interaction patterns where appropriate.

## Handoff
A companion archive `DEVFOLIO_Phase02_10_Component_Library_Pack.zip` is available in the project conversation: **eight editable SVG reference sheets**, PNG previews/contact sheet, JSON component registry, design/interaction/Penpot/QA docs and an OFFLINE interactive HTML state demonstration. The HTML demo **does not connect to servers, save real drafts or publish anything**.

**Native Penpot components and interactions must be manually created and tested in your design file**; no Penpot integration has been installed or used. See `10_PENPOT_COMPONENT_SETUP.md`.
