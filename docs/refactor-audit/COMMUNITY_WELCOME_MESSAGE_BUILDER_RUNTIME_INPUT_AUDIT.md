# Community Welcome Message Builder Runtime Input Audit

Base: `a6c2e30`. Target: `src/systems/communityConcierge.js#sendConciergeWelcome(member)`, triggered by `guildMemberAdd`.

The legacy lookup remains unchanged: onboarding `guideChannelId` selects cache/fetch or the name fallback. The resolved channel supplies only `guideChannel.id`. The existing payload shape is `{ content }`, its exact template interpolates `member.guild.name`, `member.guild.id`, and `guideChannel.id`, and DM rejection is swallowed with `.catch(() => null)`. The new builder is `buildCommunityWelcomeMessage(request, { guildName })`; the mapper is `mapLegacyWelcomeDeliveryRequest({ guildId, guideChannelId })`, both imported through `../application/community`.

No result/failure contract, port, adapter, composition, lookup abstraction, persistence, retry, dedupe, or validation is part of this slice.
