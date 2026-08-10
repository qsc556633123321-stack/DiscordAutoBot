# Community Welcome Channel Runtime Redirect Post-Implementation Readiness

The Welcome tracked-channel read now uses the shared channel tracking Port and
compatibility Adapter at runtime. Guide and Roadmap behavior remains unchanged.

| Candidate | Decision |
| --- | --- |
| A. Shared Legacy Read/Write Helper Cleanup Preparation | **Recommended next.** `readOnboardingData` and `saveOnboarding` have zero runtime consumers. |
| B. `readOnboardingData` Cleanup Preparation | Included in A; do not remove it without a dedicated compatibility audit. |
| C. `saveOnboarding` Cleanup Preparation | Included in A; retained helper cleanup requires its own scope. |
| D. Welcome Closure Audit | Deferred; the runtime contract is covered by this implementation slice. |
| E. Deployment Readiness Preparation | Deferred; other high-risk Community flows remain legacy-owned. |
| F. Next High-risk Community Feature | Deferred until shared helper cleanup is characterized. |

The next slice must not combine helper cleanup with a new Discord mutation or
community feature migration.
