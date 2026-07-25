# Community Guide/Roadmap Persistence Readiness Decision

| Candidate | Consumer/schema certainty | Preservation/failure certainty | Concurrency / blast radius | Status |
| --- | --- | --- | --- | --- |
| Guide Record Read | high | medium | shared root | Needs more baseline |
| Guide Record Patch | high | medium | send-before-write duplicate risk | Blocked |
| Roadmap Record Read | high | medium | shared root | Needs more baseline |
| Roadmap Record Patch | high | medium | send-before-write duplicate risk | Blocked |
| Shared Publication State Read | medium | medium | unknown-field ownership | Needs more baseline |
| Shared Publication State Patch | medium | medium | no atomicity/locking contract | Blocked |
| Full onboarding-flow repository | medium | low | broad unknown consumer risk | Blocked |
| Field-level JSON patch writer | low | low | changes legacy write semantics | Rejected |

## First Persistence Preparation Slice

**No Persistence Preparation Slice Approved.**

The contract is frozen, but no new persistence port/repository/adapter is safe
until malformed-root coverage, cross-feature consumers, concurrent-write
semantics, and compatibility for unknown fields are resolved without changing
the active runtime.
