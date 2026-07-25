# Community Guide/Roadmap Legacy Schema Map

`src/data/onboarding-flows.json` is an object. The repository currently ships
an empty object; all fields below are observed runtime fields, not a new schema.

| JSON path | Type | Required | Read consumers | Write consumers | Owner | Preservation / risk |
| --- | --- | --- | --- | --- | --- | --- |
| `$` | object | yes at runtime | `readOnboardingData` | `writeJson` | Shared Legacy | non-object/array falls back to `{}` |
| `$.{guildId}` | object | optional | Guide, Roadmap, welcome | `saveOnboarding` | Shared Legacy | shallow merge preserves sibling fields |
| `$.{guildId}.guideChannelId` | string | optional | Guide welcome | Guide | Guide | replaced only by Guide patch |
| `$.{guildId}.guideMessageId` | string | optional | Guide setup | Guide | Guide | absent/unfetchable ID causes send |
| `$.{guildId}.roadmapChannelId` | string | optional | no current reader beyond persisted state | Roadmap | Roadmap | preserved by Guide shallow merge |
| `$.{guildId}.roadmapMessageId` | string | optional | Roadmap setup | Roadmap | Roadmap | absent/unfetchable ID causes send |
| `$.{guildId}.nativeTaskRecommendations` | array | optional | no current JSON reader | Guide | Native Onboarding | written but not read by this runtime |
| `$.{guildId}.nativeTaskExcludedChannels` | array | optional | no current JSON reader | Guide | Native Onboarding | written but not read by this runtime |
| `$.{guildId}.updatedAt` | ISO string | runtime-added | no current reader | Guide/Roadmap | Shared Legacy | overwritten on every save |
| `$.{guildId}.<unknown>` | any | optional | unknown | unknown | Unknown | shallow merge preserves unless patch uses same key |

Not Present: version, metadata root, transaction ID, writer ID, locking key,
idempotency marker, message-history marker, rollback record, or compensation
record. `guideChannelId` and native recommendation fields are written but have
limited/no direct Guide/Roadmap read use; no field is inferred as required.
