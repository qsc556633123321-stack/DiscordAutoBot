# Community Roadmap Resource Session Mutation Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Production Session Mutation Extension, not Adapter wired | Ready and recommended |
| B. Mutation Failure Handoff preparation | Covered by Candidate A semantics |
| C. Mutation Adapter preparation | Deferred |
| D. Pair Mutation Capability preparation | Deferred |
| E. Runtime Mutation preparation | Not approved |
| F. Keep Legacy | Current runtime behavior |

Candidate A may add only Session mutation methods and a presence-aware failure
getter. It must preserve exact `M`/`S`, raw rejection identity including
`undefined`, stale-failure clearing, zero extra I/O, and no persistence/retry.
