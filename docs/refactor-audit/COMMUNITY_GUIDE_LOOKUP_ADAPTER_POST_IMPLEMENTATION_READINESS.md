# Guide Lookup Adapter Post-Implementation Readiness

| Candidate | Status |
| --- | --- |
| A. Mutation Adapter preparation using production Session | Ready |
| B. Production Mutation Adapter, not wired | Ready with explicit exclusions |
| C. Per-invocation adapter-pair preparation | Needs more preparation |
| D. Composition preparation | Blocked |
| E. Runtime Session plus Lookup integration | Blocked |
| F. Full Lookup/Mutation runtime integration | Blocked |
| G. No further migration | Rejected |

Recommended next slice: A, Mutation Adapter preparation using the production
Session. It must not add runtime wiring.
