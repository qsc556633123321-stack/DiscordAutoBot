# Community Welcome Delivery Result Runtime Readiness

| Candidate | Status | Decision |
| --- | --- | --- |
| A. Internal Result computation, outward return unchanged | Needs more preparation | needs a stable shadow boundary and explicit error semantics |
| B. Return Result directly | Rejected | changes legacy return shape |
| C. Failure Reason only | Rejected | reasons are not caller-observable |
| D. Result plus Failure Reason | Rejected | compounds return and error risks |
| E. Shadow Result for tests/logging | Needs more preparation | logging/metrics are out of scope |
| F. Delivery Port | Blocked | lookup and send remain coupled |
| G. Discord Adapter | Blocked | member.send/catch contract is active runtime |
| H. Full `sendConciergeWelcome` migration | Blocked | caller, lookup, and error contract are not isolated |
| I. No Result Runtime Integration | Ready | preserves all observed behavior |

No Result integration slice is approved. Community migration remains in progress.
