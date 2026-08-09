# Community Roadmap Mutation Adapter Implementation Readiness

| Candidate | Decision |
| --- | --- |
| A. Production Roadmap Mutation Adapter, not Pair wired | Implemented |
| B. Pair Mutation Surface preparation | Ready and recommended |
| C. Runtime Mutation Redirect preparation | Not approved |
| D. Failure-handoff Pair Surface preparation | Deferred |
| E. More Session preparation | Not needed |
| F. Keep legacy runtime mutation | Current behavior |

The production adapter now preserves the Session mutation methods, strict Edit
ID invariant, raw failure propagation, `undefined` presence behavior, success
ID sources, and no-I/O/persistence constraints. It remains unexposed from the
Pair and runtime.
