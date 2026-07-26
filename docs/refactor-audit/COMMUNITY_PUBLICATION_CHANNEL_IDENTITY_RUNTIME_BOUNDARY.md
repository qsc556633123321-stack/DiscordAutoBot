# Community Publication Channel Identity Runtime Boundary

| Area | Classification | Reason |
| --- | --- | --- |
| `sendConciergeWelcome` Guide channel lookup | Read-only but Discord-coupled | cache/fetch then DM behavior |
| Guide channel ensure/write | Mutation coupled | creates/moves channel, overwrites permissions, publishes message |
| Roadmap channel ensure/write | Mutation coupled | creates channel, publishes message |
| `saveOnboarding` channel fields | Persistence coupled | shared full-root writer |
| Bootstrap/Rebuild callers | Broad indirect mutation | invoke Guide setup among many operations |

No narrow channel-identity runtime read is approved in this preparation slice.
