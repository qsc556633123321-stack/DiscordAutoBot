# Community Welcome Message Builder Runtime Target Decision

| Candidate | Decision |
| --- | --- |
| A. Pure builder only | Complete in preparation. |
| B. Request mapper plus pure builder | Selected and complete: it replaces only the inline `{ content }` construction. |
| C. Builder plus Result contract | Rejected; result is not runtime-integrated. |
| D. Builder plus Failure Reason | Rejected; failure remains legacy catch behavior. |
| E. Delivery port | Rejected. |
| F. Discord DM adapter | Rejected. |
| G. Full `sendConciergeWelcome` migration | Blocked; lookup and delivery remain coupled. |

Candidate B changes one production file. It preserves resolved inputs, exact content, member-DM API/catch, lookup, early return, return value, JSON reads, and zero persistence writes. Rollback is one commit revert.
