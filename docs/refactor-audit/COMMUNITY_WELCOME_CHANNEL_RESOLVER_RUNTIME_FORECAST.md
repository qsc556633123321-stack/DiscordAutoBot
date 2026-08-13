# Community Welcome Channel Resolver Runtime Forecast

The future redirect may replace only the direct resolution expression with:

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

Tracking read, semantic request mapping, payload build, `member.send`, failure
handling, and return behavior remain unchanged. This forecast is not runtime
wiring and requires a separate redirect preparation slice.
