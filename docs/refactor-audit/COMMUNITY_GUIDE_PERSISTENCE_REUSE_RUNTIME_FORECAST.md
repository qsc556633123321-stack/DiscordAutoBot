# Community Guide Persistence Reuse: Runtime Forecast

This is a future-shape reference, not runtime wiring for this slice.

```js
const request = createGuidePersistenceRequest({
  guildId: guild.id,
  channelId: channel.id,
  messageId: message.id,
  nativeTaskRecommendations: NATIVE_ONBOARDING_RECOMMENDATIONS,
  nativeTaskExcludedChannels
});

communityGuidePersistenceFeature.persist(request);
```

A later redirect slice must verify that the runtime ignores the generic result,
preserves legacy ordering and partial-success behavior, and retains exact
invariant failures. Until then, `setupCommunityGuide` calls `saveOnboarding` as
its final known runtime persistence consumer.
