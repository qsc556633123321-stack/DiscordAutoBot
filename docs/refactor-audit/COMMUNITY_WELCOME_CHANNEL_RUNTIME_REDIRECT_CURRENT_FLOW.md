# Community Welcome Channel Runtime Redirect Current Flow

The current runtime flow in `sendConciergeWelcome` is frozen as:

```text
member.guild.id
-> readOnboardingData()[guildId] || {}
-> data.guideChannelId
-> truthy: cache.get(id) || channels.fetch(id).catch(() => null)
-> falsy: findChannelByName(guild, GUIDE_CHANNEL_NAME)
-> no channel: return undefined
-> map legacy welcome delivery request
-> build welcome payload
-> member.send(payload).catch(() => null)
```

Fetch rejection returns `null` and exits without a name fallback. Falsy IDs use
the name fallback. Reader failure is absorbed by the compatibility reader and
therefore follows that same falsy path.
