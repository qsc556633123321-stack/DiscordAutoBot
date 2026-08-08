# Community Guide Discord Mutation Port Input Audit

Base: `5728528`. This is a preparation-only audit; production runtime remains
unchanged.

## Current Runtime Boundary

`src/systems/communityConcierge.js#setupCommunityGuide()` owns the complete
Guide publication workflow:

```text
getOrCreateGuideChannel(guild)
-> buildGuidePayload(guild)
-> readOnboardingData()[guild.id]
-> channel.messages.fetch(guideMessageId).catch(() => null), when eligible
-> buildGuidePublicationMutationPlan(...)
-> message.edit(payload) OR channel.send(payload)
-> saveOnboarding(guild.id, guide patch)
-> return { channel, message }
```

## Branch Inputs and Outputs

| Concern | Edit existing message | Send new message | Current owner |
| --- | --- | --- | --- |
| Guild identity | `guild.id` | `guild.id` | Legacy runtime |
| Channel identity | `channel.id` | `channel.id` | Legacy runtime |
| Message identity | stored `guideMessageId`, then fetched message | none before send | Legacy runtime |
| Discord object | fetched `message` | resolved `channel` | Legacy runtime |
| Operation | Plan: `EditExistingMessage` | Plan: `SendNewMessage` | Application Plan |
| Payload | `buildGuidePayload(guild)` result | same | Legacy runtime/read composition |
| Success identity | existing `message.id` | returned `message.id` | Legacy runtime |
| Persistence handoff | Guide patch after edit | Guide patch after send | Legacy runtime -> migrated writer |

## Findings

1. `GuidePublicationExecutionRequest` has operation, payload, and tracked
   message ID only. It cannot identify a Discord destination independently.
2. The Plan is correctly limited to branch selection; it owns neither lookup
   nor Discord mutation.
3. Edit lookup happens before Plan construction. Send destination resolution
   happens before payload construction and remains part of channel ensure.
4. A future port needs scalar IDs, never Discord.js Guild, Channel, or Message
   objects as application inputs.
5. Persistence, Roadmap continuation, and interaction replies are explicit
   outer-workflow responsibilities and are not port inputs.
