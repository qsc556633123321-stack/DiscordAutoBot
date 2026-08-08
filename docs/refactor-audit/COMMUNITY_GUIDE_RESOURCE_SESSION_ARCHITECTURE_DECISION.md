# Guide Resource Session Architecture Decision

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Production infrastructure resource session, not wired | Ready | Candidate only; production code prohibited in this slice |
| B. Per-invocation lookup and mutation adapter preparation | Ready with explicit exclusions | Requires the same session instance |
| C. Per-invocation lookup and mutation adapter implementation | Needs more preparation | Depends on approved production session and runtime boundary |
| D. Composition preparation | Needs more preparation | Cannot own invocation-local Discord resources |
| E. Runtime session integration | Blocked | Requires a focused runtime migration slice |
| F. Keep continuity legacy-owned | Ready | Current safe runtime state |
| G. Reject resource session | Rejected | It is required to avoid re-resolution drift |

No production implementation is approved by this preparation slice. The next
candidate is a separately approved production session implementation, not
adapter wiring or runtime redirect.
