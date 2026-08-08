# Community Guide Pre-Plan Message Lookup Result Contract

| Candidate | Shape | Assessment |
| --- | --- | --- |
| A | `{ available: boolean }` | Too lossy: cannot distinguish a skipped lookup from an attempted unavailable lookup. |
| B | `{ status: LookupSkipped | MessageAvailable | MessageUnavailable, messageId }` | Recommended. Preserves legacy branch state without exposing Discord objects or errors. |
| C | `{ status, failureKind, messageId }` | Rejected. Legacy makes reject and null equivalent; `failureKind` over-models an unobservable distinction. |

Candidate B is a preparation-only pure Application contract proposal, not a
production export in this slice. `messageId` remains opaque and is never
normalized, stringified, trimmed, or validated here.
