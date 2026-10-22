# Phase 02.7 — Admin CMS Wireframe Review Checklist

**Status:** Owner approved wireframe direction on 2026-10-23 (ADR-WF-003). This QA checklist remains OPEN for detailed functionality, Penpot/accessibility verification and approved-SRS reconciliation.
**Approvals inherited:** ADR-UI-001, ADR-IA-001, ADR-WF-001, ADR-WF-002.
**Unresolved gate:** Approved Phase 01 SRS absent from GitHub; `docs/phase01/SRS_RECONCILIATION.md` remains OPEN.

## Coverage
- [ ] Login, email challenge, password recovery/reset
- [ ] Dashboard/overview and responsive shell
- [ ] Projects, Research, Publications, Writing, Experience, Education, Skills, Achievements, Open Source collection patterns
- [ ] Profile edit and content editors (project/research/article)
- [ ] Saved draft, private preview, publish confirmation, unpublish and revisions
- [ ] Media library/upload/reject and resume publication
- [ ] Private inbox and message detail
- [ ] Site/navigation, SEO and account security settings
- [ ] Session expired, form validation and empty/no-filter-results states

## Behavior & safety
- [ ] Server-side auth boundary is represented correctly; no public signup
- [ ] Password challenge and recovery errors don't enumerate accounts
- [ ] Research stage vs CMS publication status independent
- [ ] Save Draft, Preview, Publish and Restore distinctly labeled and scoped
- [ ] Upload progress/rejection/referenced-media protection documented
- [ ] No message PII or credentials in public prototype screens
- [ ] Mobile navigation/modal focus rules and accessible alternatives documented
- [ ] Missing/invalid form fields have inline messages and summary
- [ ] Long forms have clear progress, sticky actions only if they don't obscure content
- [ ] No fabricated data or misleading success messages

## Penpot + handoff
- [ ] SVG references imported to Penpot
- [ ] Native Penpot boards/variants created with Flex/Grid constraints
- [ ] Desktop and mobile views reviewed (including 320px, zoom, keyboard)
- [ ] Prototype flows connected and tested in View mode
- [ ] Approved SRS fields and routes reconciled against all admin modules
- [x] Owner approved the proposed wireframes at wireframe level (ADR-WF-003, 2026-10-23).
- [ ] Actual design file/prototype links saved (when available)

## Npm-first implementation mapping (later)
- UI and accessible primitives: shadcn/ui/Radix
- Forms: react-hook-form + zod + resolvers
- Table engine: @tanstack/react-table
- Rich text: @tiptap/react
- File selection: react-dropzone
- Icons: lucide-react
All require verification and do not replace authorization, sanitization or backend validation.
