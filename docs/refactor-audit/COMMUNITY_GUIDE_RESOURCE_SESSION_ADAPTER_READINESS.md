# Guide Resource Session Adapter Readiness

| Candidate | Status |
| --- | --- |
| A. Lookup adapter preparation using the production session | Ready |
| B. Mutation adapter preparation using the production session | Ready with explicit exclusions |
| C. Per-invocation lookup adapter implementation, not wired | Needs more preparation |
| D. Per-invocation mutation adapter implementation, not wired | Needs more preparation |
| E. Composition preparation | Blocked |
| F. Runtime session integration | Blocked |
| G. No further migration | Rejected |

The recommended next slice is A or B, one adapter preparation only. Neither
adapter implementation nor runtime integration is approved here.
