# Community Guide Generic Persistence Reuse Matrix

| Requirement | Generic publication persistence | Reuse decision |
| --- | --- | --- |
| `guildId` | validates and scopes one record | Reuse |
| Guide IDs | accepts arbitrary shallow patch fields | Reuse |
| Native recommendation fields | accepts arbitrary shallow patch fields | Reuse, as existing generic onboarding-state writer |
| Merge / other guild preservation | whole-root read + shallow merge | Reuse |
| `updatedAt` | owned by use case | Reuse |
| Sync behavior | `writeFileSync` | Reuse |
| Writer logging / `persisted:false` | filesystem adapter | Reuse |
| Result | runtime currently ignores it | Preserve ignore behavior |

No Guide filesystem adapter, JSON repository, writer, or dedicated Port is justified. Future Guide semantic ownership belongs in an Application request plus a thin Composition reuse feature, not a duplicate persistence implementation.
