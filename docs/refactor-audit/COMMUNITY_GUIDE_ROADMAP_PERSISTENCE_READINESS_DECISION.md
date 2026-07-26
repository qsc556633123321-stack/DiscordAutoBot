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

Publication identity remains a separate blocker: persisted IDs have no semantic
validation or recovery contract.

## Boundary Preparation Update (2026-07-26)

The semantic state/operation contract is prepared for tests only. No production
persistence port, filesystem adapter, retry policy, transaction, or runtime
consumer is approved.

The coexistence baseline documents that Guide and Roadmap share a full-root
writer; stale writes are last-write-wins and may lose either publication.

Guide read mapping is complete; it does not approve Roadmap read mapping or any
persistence integration.
