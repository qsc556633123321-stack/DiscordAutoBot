# Community Guide Migration Closure Decision

## Result

**CLOSED WITH SHARED READ DEPENDENCY**

Lookup, mutation, and persistence are migrated through approved ports, adapters, composition features, and the semantic persistence request. Tests confirm retained message identity, mutation failure identity, writer-swallowed partial success, one atomic four-field write, no retry, and no rollback.

The remaining `readOnboardingData` use is a classified shared compatibility read for the tracked Guide message ID. It is not direct Discord I/O, direct persistence, or a write responsibility. `saveOnboarding` has zero production runtime consumers but remains a cleanup candidate rather than being removed by this audit.

## Candidate Assessment

| Candidate | Result |
| --- | --- |
| A. saveOnboarding Cleanup Preparation | Deferred; safe-looking but requires dedicated reachability and removal preparation. |
| B. Guide Read Boundary Migration Preparation | **Recommended next**; the remaining shared read dependency is the smallest active Guide ownership boundary. |
| C. Community Shared Legacy Cleanup Preparation | Not yet; broader than the classified Guide read boundary. |
| D. Deployment Readiness Preparation | Not ready; other high-risk community runtime boundaries remain. |
| E. Next Community Feature Migration | Deferred until the active Guide read boundary is decided. |
| F. Keep Current State | Rejected; the remaining ownership is known and bounded. |
