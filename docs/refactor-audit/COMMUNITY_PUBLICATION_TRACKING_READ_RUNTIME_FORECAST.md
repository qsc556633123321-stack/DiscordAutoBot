# Community Publication Tracking Read Runtime Forecast

## Future Guide Shape

After a separate redirect-preparation slice approves construction and ordering,
Guide may obtain its tracked message ID through the shared boundary:

```js
const { trackedMessageId } = trackingReadPort.readTrackedMessage({
  guildId: guild.id,
  publication: 'guide'
});
```

## Future Roadmap Shape

Roadmap may use the same narrow query with its own discriminator:

```js
const { trackedMessageId } = trackingReadPort.readTrackedMessage({
  guildId: guild.id,
  publication: 'roadmap'
});
```

## Current State

This is a forecast only. `setupCommunityGuide`, `setupRoadmapPanel`, and
`sendConciergeWelcome` still use the legacy reader. Welcome remains outside the
message-only boundary because it needs `guideChannelId`, not a message ID.
