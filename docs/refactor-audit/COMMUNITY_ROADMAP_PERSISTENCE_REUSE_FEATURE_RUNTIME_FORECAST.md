# Community Roadmap Persistence Reuse Feature: Runtime Forecast

This is a future-shape reference only. It is not wired into production runtime.

```js
const request = createRoadmapPublicationPersistenceRequest({
  guildId: guild.id,
  channelId: channel.id,
  messageId: message.id
});

roadmapPersistenceFeature.persist(request);
```

The current runtime continues to call `saveOnboarding` after a successful
Roadmap message mutation. A future redirect must decide composition lifetime
and preserve the existing writer-swallowed partial-success contract. This
feature does not choose module-level, per-invocation, or composition-root
construction timing.
