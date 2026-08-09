# Community Roadmap Resource Session Mutation Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Production Session Mutation Extension, not Adapter wired | Implemented |
| B. Mutation Failure Handoff preparation | Implemented with the Session semantics |
| C. Mutation Adapter preparation | Ready and recommended |
| D. Pair Mutation Capability preparation | Deferred |
| E. Runtime Mutation preparation | Not approved |
| F. Keep Legacy | Current runtime behavior |

The Session extension preserves exact `M`/`S`, raw rejection identity including
`undefined`, stale-failure clearing, zero extra I/O, and no persistence/retry.
It remains isolated until a separately approved Mutation Adapter slice.
