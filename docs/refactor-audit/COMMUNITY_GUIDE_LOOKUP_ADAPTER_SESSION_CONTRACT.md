# Guide Lookup Adapter Session Contract

Conceptual factory: `createGuidePublicationMessageLookupDiscordAdapter({
session })`, returning `{ lookup(request) }`. The required session capability
is only `lookupTrackedMessage(messageId)`. It must not require a channel,
client, guild, resolver, or resource gateway.
