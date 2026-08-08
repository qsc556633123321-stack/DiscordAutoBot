# Guide Mutation Runtime Data Dependency Inventory

| Data | Source / variable | Type | Plan boundary | Legacy-only reason |
| --- | --- | --- | --- | --- |
| guildId | `guild.id` | pure scalar | before | identity only |
| mode | `options.mode` | pure scalar | before | preserves force semantics |
| trackedMessageId | publication state / legacy field | persistence value | before | truthy malformed IDs remain unvalidated |
| fetched message | `channel.messages.fetch()` | Discord object | after | required only for actual edit |
| availability | fetch result | pure boolean | after fetch | Plan decision input |
| guide channel | ensure helper | Discord object | legacy | lookup/create/move/overwrite coupling |
| guide payload | payload builder | payload object | legacy | current payload timing remains frozen |
| onboarding record | reader result | persistence object | legacy | shared Guide/Roadmap/native fields |
| Roadmap / interaction | callers | runtime objects | legacy | continuation and reply ordering |
