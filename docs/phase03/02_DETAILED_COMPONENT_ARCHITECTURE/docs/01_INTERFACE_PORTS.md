# Phase 03.2 — Service Interface Design (Candidates Only)

The following are **in-process ports / pseudocode**, not final HTTP routes or DB fields.

\`\`\`js
// Explicit domain result (example):
{ ok:true, value:PublicDTO, meta:{ requestId, revisionId } }
{ ok:false, error:{ code:'VALIDATION'|'UNAUTHENTICATED'|'FORBIDDEN'|'NOT_FOUND'|'CONFLICT'|'RATE_LIMIT'|'DEPENDENCY_UNAVAILABLE', fields?, retryable?, requestId } }

// Public queries: no draft access
PublishedProjects.list({ filters,sort,cursor,limit })
PublishedProjects.bySlug({ slug,locale })
PublishedResearch.bySlug({ slug,locale })
PublishedSitemap.entries({ generation })

// Owner command ports: actor derived from verified server session
SaveDraft.execute({ actor,entityType,entityId?,input,expectedRevision? })
PublishContent.execute({ actor,entityType,entityId,expectedRevision })
UnpublishContent.execute({ actor,entityType,entityId,expectedRevision })
RestoreRevision.execute({ actor,entityType,entityId,sourceRevisionId,expectedRevision })
GetPrivatePreview.execute({ actor,entityType,entityId,revisionId? })

// Integrations/identity
Media.requestUpload({ actor,declaredMime,size,digest? })
Media.finalizeUpload({ actor,uploadHandle,observedSignature,digest })
Contact.submit({ clientContext,identityFields,message,consent? })
Auth.startPasswordChallenge({ password,clientContext })
Auth.verifyEmailCode({ pendingChallengeId,oneTimeCode,clientContext })
Policy.authorize({ actor,action,resource })
UnitOfWork.run(async tx => { /* committed snapshot + revision + outbox */ })
\`\`\`

**Server truth:** domain success is only reported after durable state is authoritative. Mutations use optimistic concurrency. The publication transaction writes to Postgres and durable outbox; email/upload/cache network operations run afterward via retryable adapters. DTO mappers must allowlist public fields and exclude session IDs, OTPs, private contacts, draft bodies and internal error detail. Exact validation limits, response statuses and API paths are waiting for owner-approved SRS and Phase 03.4.
