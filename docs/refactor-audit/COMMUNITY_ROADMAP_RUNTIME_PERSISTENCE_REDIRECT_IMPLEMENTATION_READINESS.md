# Community Roadmap Runtime Persistence Redirect: Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Runtime Persistence Redirect Only | Ready with explicit exclusions |
| B. More persistence preparation | Not needed now |
| C. Persistence plus `saveOnboarding` cleanup | Rejected for next slice |
| D. Async persistence migration | Rejected |
| E. Schema migration | Rejected |
| F. Keep legacy runtime | Current production behavior only |

Candidate A may replace only the Roadmap `saveOnboarding` call after a
successful mutation. It must construct semantic request IDs, synchronously call
`persist`, ignore its result, preserve raw generic invariant throws, and return
the existing `{ channel, message }` shape. Guide persistence remains legacy-owned.
