# Guide Runtime Persistence Feature Lifetime

| Candidate | Decision |
| --- | --- |
| A. Module-level feature | Rejected: changes construction lifetime unnecessarily. |
| B. Per invocation | Recommended. |
| C. Reuse pre-existing Guide generic instance | Rejected: none exists in Guide runtime. |
| D. Higher composition-root injection | Rejected: larger wiring diff. |

Roadmap constructs its generic and semantic persistence features after the final
mutation on each invocation. Guide should follow that convention: after final
retained Message identity, construct the generic feature with existing onboarding
file dependencies, construct the Guide feature, build one semantic request, and
synchronously call `persist`. This retains one writer path and lifetime.
