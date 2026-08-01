# Community Welcome Delivery Input Audit

Base: `10e86a5`. Runtime target: `src/systems/communityConcierge.js#sendConciergeWelcome(member)`, triggered by `guildMemberAdd`.

The legacy runtime reads `member.guild.id`, reads `guideChannelId` from onboarding JSON, resolves a guide channel, then sends `{ content }` through `member.send()`. The content interpolates `member.guild.name`, the guild ID, and the resolved channel ID. Lookup failure returns without delivery; DM rejection is swallowed. The async function resolves `undefined`, logs nothing itself, persists nothing, and has no retry/deduplication. Repeated events can send repeated DMs.

The request contract intentionally contains only resolved `guildId` and `guideChannelId`. `guildName` is not a request field; it is documented as an existing pure template context and a blocker to direct runtime use. This slice adds no runtime, Discord, JSON, persistence, or production behavior change.
