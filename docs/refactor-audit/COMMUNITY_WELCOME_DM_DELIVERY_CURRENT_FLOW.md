# Community Welcome DM Delivery Current Flow

After reader construction, channel tracking, resolver lookup, and the no-channel early return, `sendConciergeWelcome(member)` performs:

1. `mapLegacyWelcomeDeliveryRequest({ guildId: member.guild.id, guideChannelId: guideChannel.id })`.
2. `buildCommunityWelcomeMessage(request, { guildName: member.guild.name })`.
3. `await member.send(payload).catch(() => null)`.
4. Implicitly return `undefined`; the resolved Discord message or `null` is not observed by the runtime.

The recipient is the exact input `member`, the payload is the exact object returned by the builder, and a rejection causes no retry, logging, fallback send, or new error.
