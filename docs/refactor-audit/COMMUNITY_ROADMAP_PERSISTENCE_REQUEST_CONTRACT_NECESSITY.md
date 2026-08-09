# Roadmap Persistence Request Contract Necessity

The generic contract is sufficient for storage but exposes a legacy-shaped
`patch` object. A Roadmap-specific **pure scalar request boundary** is useful
to keep `roadmapChannelId` and `roadmapMessageId` out of future runtime call
sites. It must map to the generic `{ guildId, patch }` input, not replace the
generic use case or create a permanent duplicate Port.

Frozen candidate request:

```js
{ guildId, channelId, messageId }
```

It must preserve raw scalar identity and must not receive Discord objects,
perform trim/String conversion, validate snowflakes, touch the filesystem, or
log. Validation remains an explicit later decision: the generic use case still
requires a non-empty string guild ID.
