# Community Guide Persistence Reuse: Generic Feature Audit

The approved generic dependency is
`createCommunityPublicationStateFeature`. It exposes the synchronous path:

```js
communityPublicationStateFeature.persistCommunityPublicationRecord.execute({ guildId, patch })
```

The generic use case validates `guildId` and patch shape, owns `updatedAt`, and
delegates the shallow merge and `{ persisted, record }` result to the existing
filesystem-backed repository. It also retains writer logging and swallowed
write-failure behavior. A Guide feature must neither duplicate nor intercept
those responsibilities.

The existing Guide mapper supplies the one atomic patch containing
`guideChannelId`, `guideMessageId`, `nativeTaskRecommendations`, and
`nativeTaskExcludedChannels`.
