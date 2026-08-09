# Community Roadmap Runtime Pair Creation Implementation Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Create a Pair after channel ensure; leave it unused | Ready | The Pair is zero-I/O and tests freeze legacy lookup/mutation/persistence. |
| B. Pair creation plus lookup redirect | Needs more preparation | Lookup ownership and retained-message handoff would change together. |
| C. Runtime lookup redirect | Needs more preparation | Requires an independent lookup migration slice. |
| D. Roadmap mutation preparation | Blocked | Mutation and persistence ordering remain legacy-owned. |
| E. Keep fully legacy | Rejected as the next slice | Safe, but does not reduce the prepared runtime boundary. |

## Approved next slice

Only Candidate A is approved: import Composition in the Roadmap runtime,
construct its feature once, create one Pair per `setupRoadmapPanel` invocation
after channel ensure, and consume neither Pair capability. Lookup, edit/send,
persistence, errors, and return shape stay legacy-owned.
