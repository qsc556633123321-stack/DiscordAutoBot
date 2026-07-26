# Community Publication Channel Lookup Call Graph

```text
guildMemberAdd event
  -> sendConciergeWelcome(member) [direct, async]
  -> readOnboardingData() [direct read]
  -> data.guideChannelId
  -> channels.cache.get(id) [conditional]
  -> channels.fetch(id).catch(() => null) [conditional, async, error-swallowed]
     OR findChannelByName(guild, GUIDE_CHANNEL_NAME) [falsy identity fallback]
  -> member.send(DM).catch(() => null) [side-effecting, error-swallowed]
  -> return undefined
```

`setup-community-guide` and `refresh-community-guide` call Guide setup and Roadmap setup. Bootstrap and V3 rebuild indirectly call Guide setup with refresh mode. Those paths are not callers of `sendConciergeWelcome()` and do not change its lookup contract. Repeated member-add invocation repeats the read, lookup, and possible DM; it has no persistence-based dedupe.
