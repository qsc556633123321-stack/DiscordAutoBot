# Community Guide Channel Resource Ownership

| Responsibility | Current owner |
| --- | --- |
| Guide channel ensure / creation / naming / permissions | Legacy runtime |
| Channel ID | Legacy runtime exposes scalar identity to Application plan only |
| Discord channel object and lifetime | Legacy runtime |
| Message lookup, edit, send, reuse | Legacy runtime using same resource |
| Persistence | Migrated publication persistence feature |
| Composition | No resource wiring |

Application may receive scalar IDs, lookup results, mutation plans, and mutation
results only. It may not receive Discord channel/message/session/handle objects.
