# Community Tracking Adapter Reader Atomic Migration Post-Readiness

| Candidate | Decision |
| --- | --- |
| A. `readOnboardingData` cleanup preparation | Safe only as part of a scoped dead-helper audit. |
| B. `saveOnboarding` cleanup preparation | Safe only as part of the same audit. |
| C. Combined dead helper cleanup preparation | **Recommended next slice.** Both helpers now have zero production consumers. |
| D. Runtime filesystem ownership cleanup | Deferred; runtime still constructs the reader with `ONBOARDING_FILE` and `readJson`. |
| E. Deployment readiness preparation | Deferred; high-risk Community flows remain. |
| F. Next high-risk feature migration | Deferred until dead-helper cleanup is characterized. |

The recommended slice must delete neither helper without confirming no dynamic
consumer, no test-only production dependency, and no hidden export. It must
not combine helper cleanup with filesystem ownership restructuring.
