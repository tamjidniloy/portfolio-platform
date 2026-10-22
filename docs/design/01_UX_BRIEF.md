# Phase 02.1 — UX Brief

**Status:** REVIEWED DRAFT — art direction separately approved in ADR-UI-001
**Date:** 2026-10-23
**Requirements source:** Phase 01 draft pack available; owner states Phase 01 is complete; GitHub copy pending reconciliation.

## Product purpose
An accessible global software developer / AI-ML researcher portfolio plus a secure browser-based CMS. Ordinary content edits must not require source-code changes or redeployments.

## Audiences / primary journeys
1. Recruiter: Home -> strongest work -> background / resume -> contact.
2. Engineer: Home -> projects -> case study -> verified source/demo.
3. Research collaborator: Research -> study details -> methods, evidence, limitations -> publication/reference or contact.
4. Owner: Login -> verify email -> dashboard -> edit -> draft -> preview -> publish -> verify live page.

## Hierarchy and design principles
- Public: professional identity -> evidence of engineering -> research evidence -> background -> invitation to connect.
- Admin: overview -> list -> focused editor -> save -> private preview -> publish -> confirm result.
- Evidence before effects; truthful statuses, names and numbers; explicit primary actions; empty states; keyboard and mobile access.
- Do not show unpublished data publicly; do not represent an experiment as a peer-reviewed paper.

## Confirmed design foundation
See ADR-UI-001: hybrid minimal editorial / engineering case studies; dark navy with muted teal/blue accents; Penpot; exact public name and font open.

## Design constraints / acceptance gates
- Mobile-first, review at 320, 390, 768, 1024 and 1440 CSS px.
- Target WCAG 2.2 AA; visible focus, labeled inputs, accessible modal and drawer behavior.
- All P0 user journeys must map to approved SRS requirements; reconcile first.
- Prototypes are visual interaction models, not evidence of working authentication or publishing.

## Pending
Approved SRS revision; public-facing name; exact fonts; optional light-mode timing; final navigation and homepage copy.
