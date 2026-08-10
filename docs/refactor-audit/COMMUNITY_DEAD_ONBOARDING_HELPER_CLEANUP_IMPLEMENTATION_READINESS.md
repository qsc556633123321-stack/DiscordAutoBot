# Community Dead Onboarding Helper Cleanup Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Delete read helper only | Safe but incomplete. |
| B. Delete save helper only | Safe but incomplete. |
| C. Delete both helpers | **Recommended.** Both are private zero-consumer definitions. |
| D. Delete helpers plus filesystem cleanup | Rejected: `ONBOARDING_FILE`, `readJson`, and `ensureFile` remain active. |
| E. Keep deprecated helpers | Rejected: no compatibility API or dynamic consumer exists. |
| F. Next high-risk migration first | Deferred; this cleanup is low-risk and isolated. |

Next production allowlist: only `src/systems/communityConcierge.js`. Do not
touch the reader, tracking adapters, Ports, persistence, Composition, JSON,
`ONBOARDING_FILE`, `readJson`, or `ensureFile`.
