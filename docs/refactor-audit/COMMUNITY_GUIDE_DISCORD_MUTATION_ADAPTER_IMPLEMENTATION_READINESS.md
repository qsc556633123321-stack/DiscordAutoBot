# Guide Discord Mutation Adapter Implementation Readiness

| Candidate | Status |
| --- | --- |
| A. Production adapter implementation, not wired | Needs more preparation |
| B. Additional lookup boundary preparation | Ready |
| C. Pre-Plan message lookup port | Needs more preparation |
| D. Composition preparation | Blocked |
| E. Runtime Edit redirect | Blocked |
| F. Runtime Send redirect | Blocked |
| G. Edit + Send redirect | Rejected |
| H. Reject current adapter design | Rejected |

**Next recommended slice:** Additional lookup boundary preparation. The
pre-Plan message lookup semantic mismatch must have an explicit caller/Plan
contract before any production adapter implementation is safe.
