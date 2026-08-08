# Community Guide Runtime Lookup: Current Flow

`src/systems/communityConcierge.js#setupCommunityGuide` currently orders work as:

1. `getOrCreateGuideChannel(guild)`.
2. Create an unused per-invocation adapter pair with that exact channel.
3. Build payload, read publication state, and derive `guideMessageId`.
4. When the ID is truthy and mode is not `force`, run exactly one legacy `channel.messages.fetch(guideMessageId).catch(() => null)`.
5. Build the mutation plan from `Message | null`, then retain legacy `message.edit` or `channel.send`.
6. Persist Guide state and return `{ channel, message }`.

Payload/state work precedes lookup. `force` and falsy IDs skip lookup. The existing pair is created before payload/state and is not used by runtime lookup or mutation.
