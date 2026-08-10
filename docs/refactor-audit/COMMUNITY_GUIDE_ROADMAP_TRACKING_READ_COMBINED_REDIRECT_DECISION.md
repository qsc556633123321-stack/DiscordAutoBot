# Community Guide + Roadmap Tracking Read Combined Redirect Decision

## Decision

**A. Redirect Guide and Roadmap together in one implementation slice.**

Both entries use the same Port, the same compatibility Adapter, one legacy read,
the same normalized-state-plus-raw-fallback rule, and the same truthiness lookup
decision. They differ only by the fixed publication discriminator and Guide's
existing force-mode lookup skip.

| Candidate | Decision |
| --- | --- |
| A. Guide + Roadmap together | **Recommended** |
| B. Guide first | Rejected; no lower-risk distinction was found. |
| C. Roadmap first | Rejected; no lower-risk distinction was found. |
| D. Composition first | Rejected; direct per-invocation construction is sufficient. |
| E. Keep legacy | Rejected; boundary and equivalence coverage now exist. |

## Isolation

Welcome remains outside this decision. It reads `guideChannelId`, not a tracked
message ID, and continues to use the legacy reader unchanged.

## Approved Future Production Scope

Only `src/systems/communityConcierge.js` may change in the redirect
implementation, limited to the two imports and the two tracked message-ID read
expressions. The Port, Adapter, persistence, Guide/Roadmap lookup and mutation
adapters, Welcome runtime, and JSON must remain unchanged.
