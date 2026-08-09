# Guide vs Roadmap Tracked Publication Read Matrix

| Concern | Guide | Roadmap | Decision |
| --- | --- | --- | --- |
| State source | `readOnboardingData()[guild.id] || {}` | Same | Shared concern |
| Mapper | `fromLegacyPublicationRecord` | Same | Reuse existing mapper |
| Tracked ID | `state.guide.messageId || data.guideMessageId` | `state.roadmap.messageId || data.roadmapMessageId` | Preserve raw fallback semantics |
| Falsy ID | Skip lookup, Send | Skip lookup, Send | Same observable behavior |
| Read failure | Helper logs and returns `{}` | Same | Shared compatibility behavior |
| Lookup | Guide lookup port | Roadmap lookup port | Feature-specific after read |
| Runtime ownership | Direct shared helper read | Direct shared helper read | Candidate shared read boundary |

Welcome also reads `guideChannelId` from the same helper. It does not make the next slice a Guide-content read change; it is further evidence that the persistence record is shared publication tracking state.
