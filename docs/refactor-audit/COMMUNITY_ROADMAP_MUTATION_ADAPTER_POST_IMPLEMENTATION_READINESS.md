# Community Roadmap Mutation Adapter Post-Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Pair Mutation Surface preparation | Ready and recommended |
| B. Pair Mutation Surface implementation | Deferred pending A |
| C. Composition Mutation Wiring preparation | Deferred |
| D. Runtime Mutation Redirect preparation | Not approved |
| E. Failure Getter Pair Surface preparation | Deferred |
| F. Keep legacy runtime mutation | Current behavior |

The isolated adapter is covered for strict Edit ID matching, exact `M`/`S`
success identity sources, raw rejection propagation including `undefined`,
zero failure-getter use, no persistence, and no extra I/O.
