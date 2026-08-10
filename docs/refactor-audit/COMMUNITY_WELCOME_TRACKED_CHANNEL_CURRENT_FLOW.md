# Community Welcome Tracked Channel Current Flow

`sendConciergeWelcome(member)` currently executes this legacy-owned runtime
flow:

```text
member.guild.id
-> readOnboardingData()[guildId] || {}
-> data.guideChannelId
-> truthy: channels.cache.get(id) || channels.fetch(id).catch(() => null)
-> falsy: findChannelByName(guild, GUIDE_CHANNEL_NAME)
-> no channel: return undefined
-> map legacy welcome request
-> build welcome payload
-> member.send(payload).catch(() => null)
```

There is no `fromLegacyPublicationRecord` call. `guideChannelId` is directly
read without normalization; JavaScript truthiness selects the tracked-ID path
or the name-search fallback. The reader absorbs missing-file, malformed JSON,
and read failures into `{}`, which therefore selects the name-search fallback.
