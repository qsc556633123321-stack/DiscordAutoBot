# Community Guide Message Lookup Infrastructure Adapter Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Infrastructure Lookup Adapter Preparation | Complete | Characterized with test-only resources |
| B. Production Lookup Adapter Implementation, not wired | Blocked | channel resource boundary remains unresolved |
| C. Composition preparation | Needs more preparation | Requires a concrete adapter decision |
| D. Runtime redirect lookup only | Blocked | Must preserve exact pre-Plan timing/count and force bypass |
| E. Mutation Adapter implementation | Blocked | Depends on lookup runtime integration |
| F. Full lookup + mutation migration | Blocked | Broad high-risk mutation replacement |
| G. No further integration | Rejected | Application port is now implemented |

The next recommended slice is **Additional Channel Resource Boundary
Preparation**. It must not add an adapter, wiring, redirect, retry, repair,
normalization, history scan, transaction, or persistence behavior.
