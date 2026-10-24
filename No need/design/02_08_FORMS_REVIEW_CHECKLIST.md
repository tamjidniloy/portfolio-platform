# Phase 02.8 — CMS Form Design Review Checklist

**Status:** Owner approved Phase 02.8 DESIGN-SPECIFICATION approach on 2026-10-23 (ADR-UX-002); SRS traceability, native Penpot board verification, accessibility QA and implementation remain OPEN
**Inherited approval:** ADR-WF-003 (admin wireframe structure) and earlier ADR decisions.
**Open gate:** Approved Phase 01 SRS absent from GitHub main.

## Required form coverage
- [ ] Profile/Hero, Social Links and Site Settings mapped
- [ ] Projects, Research and Publications field groups mapped
- [ ] Writing rich editor and SEO mapping complete
- [ ] Experience, Education, Skills, Achievements, Open Source mapped
- [ ] Resume and media select/upload/replace workflow defined
- [ ] Contact Inbox read-only message record, handling and retention defined
- [ ] Security forms and server-only secrets clearly separated
- [ ] SEO overrides, canonical and redirects guardrails designed

## Interaction and validation
- [ ] Every field has control type, requiredness for draft/publish, errors and hint text
- [ ] Cross-field validation: dates, slug uniqueness, media relations, research statuses
- [ ] Save Draft / Preview / Publish / Unpublish / Archive / Restore are distinct
- [ ] Invalid publish shows accessible error summary and preserved user input
- [ ] Network failure / version conflict / unsaved edits and session expiry shown
- [ ] Reject unsafe links, unapproved routes and rich HTML at authoritative backend
- [ ] Files validated on server; referenced media cannot be silently deleted
- [ ] No PII/OTP/password hash/private file ever appears publicly

## Penpot and responsiveness
- [ ] SVGs reviewed and imported as vector references
- [ ] Native Penpot form boards with Flex/Grid and reusable components created
- [ ] Desktop 1440 and mobile 390 designs inspected
- [ ] Mobile 320px reflow and 200% zoom annotated/tested
- [ ] Keyboard/focus/escape/screen reader/error announcements defined
- [ ] Prototype happy-path and errors connected in Penpot View mode

## Engineering & approval
- [ ] Component mapping favors established JavaScript/npm packages without installing now
- [ ] Owner-approved Phase 01 SRS reconciled against provisional field registry
- [x] Owner approved Phase 02.8 design specification on 2026-10-23 (ADR-UX-002). Penpot links and SRS reconciliation remain pending.
- [ ] Public brand/name and exact font remain open where intended

**Do not merge as finished Phase 02 designs or mark Phase 02 complete until outstanding gates are resolved.**
