# Community Post-StateReader JSON Migration Readiness

| Candidate | Result |
| --- | --- |
| A: Runtime Filesystem Cleanup Preparation | Recommended next. `ensureFile` and `readJson` now have zero active runtime consumers; `DATA_DIR` and `ONBOARDING_FILE` remain runtime path ownership. |
| B: Dead ensureFile/readJson Cleanup Preparation | Included in Candidate A; do not delete without characterization. |
| C: Role / Membership Boundary Preparation | Deferred. |
| D: Button Boundary Preparation | Deferred. |
| E: Channel Setup Boundary Preparation | Deferred. |
| F: AI Boundary Preparation | Deferred. |

Local progress is reassessed at **87%** because runtime filesystem dependency ownership moved, while runtime path ownership and helper cleanup remain.
