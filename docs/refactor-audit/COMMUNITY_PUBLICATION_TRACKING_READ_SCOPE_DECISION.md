# Community Publication Tracking Read Scope Decision

## Decision

**Message-only shared semantic query.**

| Scope | Result |
| --- | --- |
| Message-only | **Recommended.** Directly covers Guide and Roadmap's same tracked-message requirement. |
| Full publication state | Rejected. Existing normalized state would not alone preserve raw fallback behavior. |
| Message plus channel | Deferred. Welcome needs a channel query but does not justify widening the first contract. |
| Separate semantic queries | Deferred for future channel query; no Guide/Roadmap duplicate ports. |
| Raw legacy record | Rejected. Would leak legacy JSON back into runtime. |

The first boundary is intentionally narrow: it returns one tracked message ID for one supported publication. Welcome remains a forecasted second semantic query, not a reason to expose the underlying record.
