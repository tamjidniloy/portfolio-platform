# DEVFOLIO OS — Project Brief (Draft v1.0)

**Status:** Draft v1.1 — awaiting owner review. **Owner:** Portfolio administrator. **Date:** 2026-10-22.

## Vision
Build a publicly accessible, responsive and discoverable professional portfolio for a software developer and AI/ML researcher, paired with a private form-driven CMS that allows routine content updates without source-code edits or redeployment.

## Target audiences
1. Recruiters and hiring managers evaluating engineering capability.
2. Engineers and potential collaborators evaluating projects, code and technical decisions.
3. Researchers evaluating methods, experiments, publications and reproducibility.
4. General visitors seeking biography, resume, contact information or writing.
5. The owner acting as sole administrator.

## Project objectives
- Communicate professional identity clearly within the first screen.
- Provide navigable, detailed evidence of engineering and research work.
- Ensure every content type needed at launch can be maintained through the admin dashboard.
- Maintain trustworthy claims: work-in-progress research must not be presented as published research.
- Deploy securely under HTTPS with appropriate backup, recovery and monitoring controls.
- Keep the architecture maintainable and economic for a one-person portfolio.

## Constraints and architectural intent
- JavaScript, React, Node.js, Express, PostgreSQL.
- React server-rendering strategy, modular monolith, admin and public pages under a shared origin where practicable.
- PostgreSQL is the source of truth; large files live in object storage.
- Authentication: sole admin account, password + verified email login challenge, no visitor registration.
- Managed hosting, version-controlled schema and tested migration path.
- Prefer vetted, compatible open-source packages to reinventing generic components.

## In-scope release 1
Public pages, content CRUD, media uploads, draft/preview/publish, SEO, resume, contact form, admin authentication, backup and deployment.

## Out-of-scope release 1
Visitor accounts, online payments, chatbots, custom ML inference, microservices, multiple editors, automatic GitHub synchronization, multilingual translation, scheduled publication.

## Release 1 boundaries in detail
- **Public experience:** homepage, about, projects + case studies, research + detail pages, education, career history, skills, credentials/achievements, articles, contact and optionally published resume. Hide empty sections rather than manufacture entries.
- **Private experience:** secure owner-only admin, form-based editing of all public content, media management, draft/preview/publish/archive, revisions, contact inbox, site metadata and basic design settings.
- **Quality and launch:** semantic responsive UI, server-rendered indexable pages, accessibility, test coverage, monitored hosting, HTTPS, database migration and tested backup recovery.
- **Data truthfulness:** no invented qualifications, publications, results or employment claims; research/publication labels must accurately describe status.

## Success criteria
All P0 functional and non-functional requirements pass their acceptance tests; public site is responsive and usable; dynamic content updates without redeployment; private data remains private; backups can be restored.

## Critical assumptions to approve
Real content will be provided by the owner; public-facing achievements require evidence; third-party provider choices remain provisional until implementation; legal/privacy obligations depend on final analytics and contact setup.

## Requirements and reuse principles
- All editable public content must originate from authenticated CMS forms and PostgreSQL rather than hardcoded values.
- Reuse vetted npm packages, maintained UI components, official templates and proven server libraries where they genuinely simplify implementation.
- Package versions, license compatibility, SSR compatibility and security characteristics are verified before installation; custom code remains for domain-specific behavior.
- Preserve JavaScript as the application programming language unless the owner explicitly approves a change.

## Approval checklist (for Step 01.2)
- [ ] Owner agrees with the vision and target audiences.
- [ ] Owner approves the Release 1 feature boundaries.
- [ ] Owner approves Release 1 exclusions.
- [ ] Owner confirms the JavaScript/React/Express/PostgreSQL constraints and npm-first preference.
- [ ] Owner confirms the site should represent genuine experience and research accurately.
- [ ] Preferred public name and primary headline are supplied, or explicitly marked TBD for the following content-inventory step.

**Approval:** Pending. Do not change this to Approved until the owner confirms the checklist and date.