# Community Welcome Channel Resolver Runtime Forecast

After the approved redirect, the channel-resolution portion of `sendConciergeWelcome` will be:

```js
const channelResolver = createCommunityWelcomeChannelResolver({
  guild: member.guild,
  findChannelByName
});
const guideChannel = await channelResolver.resolve({
  trackedChannelId: guideChannelId,
  fallbackChannelName: GUIDE_CHANNEL_NAME
});
```

The runtime will still own the tracking read, no-channel return, semantic request mapping, payload building, and `member.send(payload).catch(() => null)`. This document is a forecast only; this preparation slice does not alter production runtime.
