# Community Tracking Adapter Reader Migration Atomicity Decision

| Candidate | Decision |
| --- | --- |
| A. Adapter contract only | Rejected: runtime still supplies `readOnboardingData`, so production would break. |
| B. Dual dependency | Rejected: adds a permanent-looking transitional API and two ownership paths. |
| C. Adapter contract plus all runtime construction redirects | **Approved minimum implementation.** It replaces both adapter contracts and all three existing injection sites atomically. |
| D. Runtime reader construction only | Rejected: adapters cannot consume the object yet. |
| E. Composition migration | Rejected: per-invocation construction is the current convention. |

The atomic implementation may modify only both tracking adapters and
`src/systems/communityConcierge.js`; the reader, Ports, persistence, JSON, and
Composition remain unchanged.
