# Phase 03.2 — Proposed JavaScript Module Layout / Import Guardrails

\`\`\`text
app/
  routes/                          # public + admin React Router loaders/actions
  components/                      # Phase 02 dark UI tokens and reusable widgets
  features/public/ features/admin/ # presentation and DTO consuming views
  server/
    request/                       # headers/context/errors
    application/commands/          # SaveDraft, Publish, Unpublish, Contact
    application/queries/           # Safe published queries and authorized owner reads
    application/dto/               # Explicit safe serialization
    domain/{projects,research,writing,profile,settings,publishing,media,contact,identity}/
    security/                      # session, CSRF, Policy
    ports/                         # repo, clock, mail, storage, outbox
    infrastructure/{postgres,email,object-storage,outbox,cache}/
    observability/
server/                            # Candidate custom Express host integration
tests/{unit,integration,e2e,security,accessibility}/
\`\`\`

Strict import direction: UI → routes → application → domain and ports; infrastructure implements ports. Domain **cannot import** React, Express, ORM, SMTP or cloud SDKs. Routes **cannot import** ORM, private repository implementations or file/email SDKs. Public query facade **cannot import** draft repository. Cross-domain workflows use explicit use cases, no mutual circular imports. Proposed enforcement at Phase 04: static import rule, dependency graph, public DTO leak tests, negative authorization tests.

No packages or folders of a working app have been installed or scaffolded.
