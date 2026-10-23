# 03.6.3 — CI/CD and secure release process

Proposed flow: PR review → secret scan, dependency/package lock/OS vulnerability checks, unit/integration/type/static architecture tests → immutable build+SBOM/provenance candidate → staging deployment on same image digest → staged migration/preflight → SSR/public private and admin auth/CSRF negative checks, contact/email failure paths, accessibility/browser/performance checks → explicitly audited owner release authorization → production preflight/backup → compatible migrations → deploy identical artifact digest → health/privacy smoke checks → evidence-backed completion or rollback.

Supply chain: minimal GitHub Actions permissions, no production secret access for PRs or untrusted workflow events, pinned action SHAs after audit, dependency lockfiles, restricted artifact/registry access and immutable digests. OIDC with narrowly scoped audience/subject is preferred when supported. Record commit SHA, artifact digest, stage test evidence, migration version, user-approved release actor/date and rollback candidate.

No `pull_request_target` execution of untrusted PR code, no blind privilege escalation, and no build-on-production. Release job must be serialized; migration role and runtime identity must be separate. Database migration rollback is not equivalent to application image rollback: use expand/contract changes and backward-compatible reader paths. Fail closed if required security/privacy tests fail.

**Templates not executable workflows:** `templates/ci-workflow-CANDIDATE.yml` is under the docs tree, not `.github/workflows`. It contains **no production deploy job** and no assumed real package/test commands. No actual CI, live cloud IAM or deployment is triggered by adding this document.
