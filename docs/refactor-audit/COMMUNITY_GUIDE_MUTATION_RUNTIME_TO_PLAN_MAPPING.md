# Guide Mutation Runtime-to-Plan Mapping

| Legacy expression | Plan field | Preservation |
| --- | --- | --- |
| `options.mode` | `mode` | pass through; `force` skips lookup |
| `publicationState.guide.messageId || data.guideMessageId` | `trackedMessageId` | no validation or coercion |
| fetch message result | `existingMessageAvailable` | true only for a resolved message |
| fetch null/rejection | `existingMessageAvailable` false | preserves send fallback |

The mapping is pure after lookup. It must not receive a Discord message/channel,
interaction, JSON root, callback, payload builder, or filesystem path.
