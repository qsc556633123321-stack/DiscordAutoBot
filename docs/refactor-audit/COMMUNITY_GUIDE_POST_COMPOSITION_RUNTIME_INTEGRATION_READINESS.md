# Guide Post-Composition Runtime Integration Readiness

Completed and unwired: application plan, lookup and mutation ports,
infrastructure session, lookup adapter, mutation adapter, Pair Factory, and
the Composition Feature.

| Candidate | Status | Reason |
| --- | --- | --- |
| A. Runtime pair-creation preparation | Ready | Characterize invocation ownership without redirecting I/O. |
| B. Runtime pair creation only | Needs preparation | Preserve legacy failure and ordering behavior. |
| C. Runtime lookup redirect preparation | Needs preparation | Lookup timing/count and fallback behavior remain legacy-owned. |
| D. Runtime lookup redirect | Blocked | Requires C. |
| E. Runtime mutation redirect preparation | Needs preparation | Failure handoff and persistence ordering remain coupled. |
| F. Runtime mutation redirect | Blocked | Requires E. |
| G. Full Guide Discord runtime integration | Blocked | Depends on B, D, and F. |
| H. Keep legacy runtime | Available | Current safe fallback. |

Recommended next slice: Candidate A, runtime pair-creation preparation only.
