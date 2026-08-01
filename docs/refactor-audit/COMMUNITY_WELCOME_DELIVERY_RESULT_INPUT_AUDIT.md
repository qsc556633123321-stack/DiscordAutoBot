# Community Welcome Delivery Result Input Audit

Base: `00ac04a`. Target: `src/systems/communityConcierge.js#sendConciergeWelcome(member)`. Active caller: `src/events/guildMemberAdd.js#execute`, triggered by `Events.GuildMemberAdd`.

The runtime reads onboarding state once, resolves `guideChannelId` through cache/fetch or `findChannelByName`, maps `{ guildId, guideChannelId }`, builds `{ content }` with `{ guildName }`, and executes `await member.send(payload).catch(() => null)`. A missing channel returns early. The function has no explicit return, so normal and swallowed-rejection paths resolve `undefined`.

Pre-send reads can throw (malformed member/guild, missing channels/fetch, cache/find failures, mapper/builder failures). `readOnboardingData` catches its own read/parse errors and returns `{}`. The event caller awaits and catches a rejected function promise, logs `Community concierge welcome failed:`, and does not use a return value. Existing Result statuses are `Delivered`, `Skipped`, `Failed`; Failure Reasons are `GuideDestinationUnavailable`, `DeliveryRejected`, `Unknown`. Neither contract is integrated at runtime.

Scope is characterization only: no Result/Reason integration, port, adapter, repository, composition, retry, queue, persistence, channel lookup migration, or full delivery migration.
