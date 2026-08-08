# Guide Lookup Adapter Implementation Readiness

| Candidate | Status |
| --- | --- |
| A. Production Lookup Adapter, not wired | Ready |
| B. Mutation Adapter preparation using Session | Ready with explicit exclusions |
| C. Production Mutation Adapter, not wired | Needs more preparation |
| D. Per-invocation adapter-pair preparation | Needs more preparation |
| E. Composition preparation | Blocked |
| F. Runtime Session integration | Blocked |
| G. No further migration | Rejected |

The recommended next slice is A: one production Lookup Adapter implementation,
not wired. It must preserve the characterized rejection-to-unavailable mapping.
