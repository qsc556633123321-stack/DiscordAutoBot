# Community Publication Channel Lookup Baseline

The active baseline is `sendConciergeWelcome(member)` in
`src/systems/communityConcierge.js`, called directly by `guildMemberAdd`.

Its only identity input is `onboarding-flows.json[guildId].guideChannelId`.
Truthiness controls the branch: truthy values use cache then fetch; falsy
values use the legacy Guide-name lookup. A resolved object is accepted solely
for its `id`, then used to compose a member DM URL. Fetch and member-DM errors
are swallowed. There is no channel creation, channel message send,
`saveOnboarding`, JSON write, mapper invocation, retry, or deduplication.

`roadmapChannelId` is not a confirmed active lookup input. Bootstrap and V3
rebuild call Guide setup/refresh indirectly, but not this welcome lookup.
