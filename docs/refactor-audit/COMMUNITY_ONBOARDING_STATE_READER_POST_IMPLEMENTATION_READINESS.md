# Community Onboarding State Reader Post-Implementation Readiness

`CommunityOnboardingStateReader` is implemented in Infrastructure and is not
runtime-used. It delegates the exact legacy-compatible `readJson(filePath, {})`
contract and does not own filesystem, logging, persistence, Discord, mapping,
or caching behavior.

| Candidate | Decision |
| --- | --- |
| A. Tracking Adapter Dependency Migration Preparation | **Recommended next.** Freeze object dependency migration before changing adapters. |
| B. Tracking Adapter Dependency Migration Implementation | Deferred until A is complete. |
| C. Runtime Injection Redirect Preparation | Deferred; runtime must not change with adapter migration planning. |
| D. `readOnboardingData` Deletion | Deferred until all adapter injections migrate. |
| E. `saveOnboarding` Deletion | Deferred as an independent cleanup slice. |
| F. Keep Legacy | Deferred; the reader boundary is now available. |
