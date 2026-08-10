# Community Welcome Channel Tracking Runtime Forecast

After a separate redirect preparation approves it, Welcome may replace only its
tracked-channel ID expression with:

```js
const trackingReadPort = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ readOnboardingData });
const request = createCommunityPublicationChannelTrackingReadRequest({ guildId: member.guild.id, publication: 'guide' });
const { trackedChannelId: guideChannelId } = trackingReadPort.readTrackedChannel(request);
```

The existing cache/fetch/name fallback, request mapping, payload construction,
DM send, and error handling remain outside this boundary and must not move.
