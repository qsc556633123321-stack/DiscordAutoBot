# Community Post Dead Helper Cleanup Readiness

## Decision

Recommend **Community Concierge Closure Audit** as the next slice.

## Candidate Assessment

| Candidate | Status | Rationale |
| --- | --- | --- |
| Runtime Filesystem Ownership Cleanup Preparation | Deferred | `ONBOARDING_FILE`, `readJson`, and `ensureFile` still require a focused mutation and ownership audit. |
| Community Concierge Closure Audit | Recommended | The two dead helpers are removed; the next smallest safe step is to re-audit the remaining active Concierge runtime boundaries before moving filesystem ownership. |
| Deployment Readiness Preparation | Deferred | High-risk community flows remain outside the completed Guide/Roadmap/Welcome tracking work. |
| Next High-risk Community Feature Migration | Deferred | A closure audit should establish the next bounded owner first. |
| Legacy Test Cleanup | Retain | Historical regression guards continue to protect behavior and source boundaries. |
| Keep Current State | Rejected | The completed cleanup supports a narrow closure audit without runtime behavior change. |

## Remaining Risk

Filesystem construction remains in `communityConcierge.js`. This slice did not
create a repository, filesystem adapter, or composition feature, and it did not
change stored data or Discord mutation behavior.
