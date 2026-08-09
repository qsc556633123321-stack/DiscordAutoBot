# Community Roadmap Final Ownership Matrix

| Concern | Runtime | Application | Infrastructure | Composition | Persistence | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Channel ensure | calls existing ensure helper | - | Discord channel creation remains behind existing helper | - | - | Compatible legacy boundary |
| Lookup | selects tracked ID and branch | Lookup Port contract | Resource Session + Lookup Adapter fetch and retain Message | Pair feature | - | Migrated |
| Message retention | consumes narrow getter | - | single Resource Session | Pair exposes getter only | - | Migrated |
| Mutation | selects edit/send | Mutation Port contract | Resource Session + Mutation Adapter | Pair feature | - | Migrated |
| Persistence request | constructs semantic IDs | request + legacy-schema mapper | - | Roadmap persistence feature delegates | generic publication writer | Migrated |
| Schema mapping | - | `RoadmapPublicationPersistenceRequest` | - | - | generic shallow merge | Legacy-compatible |
| Filesystem | - | - | generic filesystem adapter | generic feature wiring | writer swallows write failure | Shared ownership |
| Error handling | preserves return/throw contract | result vocabulary | lookup rejection maps unavailable; mutation preserves raw failure | delegates only | writer failure becomes `persisted:false` | Characterized |

There is one Roadmap Resource Session, one Lookup Adapter, and one Mutation Adapter per Pair. The public Pair surface is exactly `lookupPort`, `mutationPort`, and `getRetainedMessage`.
