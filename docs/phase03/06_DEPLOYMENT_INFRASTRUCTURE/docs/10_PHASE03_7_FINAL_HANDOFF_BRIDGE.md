# 03.6.10 — Phase 03.7 architecture integration and Phase 04 bridge

Phase 03.7 should **consolidate** component/database/API/security/deployment proposals into one integrated architecture plan, requirements/decision register, implementation work breakdown, measurable acceptance gates and owner sign-offs. Final provider-dependent deployment IaC, exact SDK versions, physical DB schema/migrations and public API stability must not be locked while SRS v1.1 remains unapproved.

## Suggested package outputs
- Current C4 context/container/component/deployment views and dependency graphs with **no conflicting publication/auth boundaries**.
- Architecture Decision Record index with each ADR status, owner, date, alternatives, risk, reversibility, sign-off evidence and linked requirements.
- Dependency/release runway: SRS owner baseline → MFA choice/privacy retention/hosting budget → schema/API/provider constraints → Phase 04 working app + CI → staging/manual UX/security/restore QA → controlled launch.
- Full upstream QA gates: Phase 02 native Penpot not verified, 142 design QA cases NOT_RUN; Phase 03.2 42 architecture review cases NOT_RUN; 03.3 40, 03.4 60, 03.5 80 and 03.6 96 check plans NOT_RUN unless independently evidenced.
- Implementation handoff should include release topology, config-key names, permissions, observability contracts, sample pipeline and restore drills, but no actual credentials.

## Immediate owner decisions needed
1. Approve or revise SRS candidate and explicitly record signed-off version/commit.
2. Resolve stronger MFA options vs legacy email challenge; do not claim NIST AAL2 from email.
3. Select hosting region/budget and provider capabilities, including private repo GitHub deployment gates.
4. Approve privacy contact and backup retention, RTO/RPO and operational responsibility.
5. Review Phase 03.3–03.6 design proposals, avoiding approval by PR merge alone.
6. Select whether Phase 04 starts once 03.7 consolidation is reviewed or while nonbinding ADRs remain tracked.
