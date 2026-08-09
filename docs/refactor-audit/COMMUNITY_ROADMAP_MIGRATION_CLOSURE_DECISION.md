# Community Roadmap Migration Closure Decision

## Decision

**CLOSED WITH SHARED LEGACY DEPENDENCIES**

Roadmap runtime lookup, mutation, and persistence are all active through approved Composition/Port surfaces. E2E closure tests prove one Session per Pair, lookup/mutation same-message identity, no runtime Discord I/O, one persistence request, schema preservation, no retry, and no rollback.

The remaining `saveOnboarding` helper is a shared Guide legacy dependency, not Roadmap ownership. It prevents shared-helper removal, but does not reopen the Roadmap slice.

## Candidate Evaluation

| Candidate | Result |
| --- | --- |
| A. Guide Persistence Migration Preparation | **Recommended next slice**; removes the remaining shared persistence ownership safely. |
| B. Roadmap Cleanup Preparation | Not recommended; no Roadmap-only production cleanup is approved. |
| C. Deployment Readiness Preparation | Deferred; Guide/shared persistence and broader migration work remain. |
| D. Shared `saveOnboarding` Cleanup | Blocked until Guide persistence migration. |
| E. Async Persistence | Rejected; would change sync legacy behavior. |
| F. Schema Migration | Rejected; current JSON format remains a compatibility contract. |
