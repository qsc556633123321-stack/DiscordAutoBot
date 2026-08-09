# Roadmap Persistence Reuse Matrix

| Roadmap need | Generic capability | Decision |
| --- | --- | --- |
| Exact guild ID | Validates non-empty string | Reuse after scalar request mapping |
| Exact channel/message IDs | Accepts caller-defined patch values | Mapper preserves raw values |
| Legacy fields | Generic patch is opaque | Map to `roadmapChannelId` / `roadmapMessageId` |
| Shallow merge / other guild preservation | Filesystem adapter | Reuse |
| `updatedAt` | Use case/adapter flow | Reuse |
| Writer logging and swallow | Filesystem adapter | Reuse unchanged |
| `{ persisted, record }` result | Adapter | Runtime must ignore result for compatibility |
| Publication discriminator | Absent | Do not introduce one in this slice |
| Synchronous execute | Current use case/adapter | Preserve; async conversion is blocked |

Decision: reuse the generic feature through a future pure Roadmap request
mapper. Reject a new Roadmap writer or repository.
