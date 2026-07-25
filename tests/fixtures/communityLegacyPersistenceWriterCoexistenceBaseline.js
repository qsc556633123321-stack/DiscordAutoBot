const mixedRecord = Object.freeze({
  guideChannelId: 'guide-channel',
  guideMessageId: 'guide-message',
  roadmapChannelId: 'roadmap-channel',
  roadmapMessageId: 'roadmap-message',
  nativeTaskRecommendations: Object.freeze(['welcome']),
  nativePrompts: Object.freeze({ version: 1 }),
  defaultChannels: Object.freeze(['entry']),
  unknownGuildField: Object.freeze({ retained: true }),
});

const fullRoot = Object.freeze({
  unknownRootField: Object.freeze({ retained: true }),
  guildA: mixedRecord,
  guildB: Object.freeze({ guideMessageId: 'guide-b', unknownGuildField: 'b' }),
  guildC: Object.freeze({ roadmapMessageId: 'roadmap-c', unknownGuildField: 'c' }),
});

module.exports = Object.freeze({
  emptyRoot: Object.freeze({}),
  oneGuildEmptyRecord: Object.freeze({ guildA: Object.freeze({}) }),
  guideOnlyRecord: Object.freeze({ guildA: Object.freeze({ guideChannelId: 'guide-channel', guideMessageId: 'guide-message' }) }),
  roadmapOnlyRecord: Object.freeze({ guildA: Object.freeze({ roadmapChannelId: 'roadmap-channel', roadmapMessageId: 'roadmap-message' }) }),
  nativeOnboardingOnlyRecord: Object.freeze({ guildA: Object.freeze({ nativeTaskRecommendations: Object.freeze(['welcome']), nativePrompts: Object.freeze({ version: 1 }) }) }),
  fullMixedRecord: Object.freeze({ guildA: mixedRecord }),
  fullRoot,
  malformedGuildRecord: Object.freeze({ guildA: null }),
  missingFileState: Object.freeze({ kind: 'missing-file' }),
  invalidJsonState: Object.freeze({ kind: 'invalid-json' }),
  guideWriterPatch: Object.freeze({ guideChannelId: 'guide-next', guideMessageId: 'guide-next-message' }),
  roadmapWriterPatch: Object.freeze({ roadmapChannelId: 'roadmap-next', roadmapMessageId: 'roadmap-next-message' }),
  nativeWriterPatch: Object.freeze({ nativeTaskRecommendations: Object.freeze(['entry', 'roles']), nativePrompts: Object.freeze({ version: 2 }) }),
  bootstrapWriterPatch: Object.freeze({ defaultChannels: Object.freeze(['entry', 'guide']) }),
  rebuildWriterPatch: Object.freeze({ layoutVersion: 'v3' }),
  staleSnapshotA: fullRoot,
  staleSnapshotB: fullRoot,
  writeFailureState: Object.freeze({ kind: 'write-failure' }),
  readFailureState: Object.freeze({ kind: 'read-failure' }),
  partialDiscordSideEffectState: Object.freeze({ kind: 'discord-send-before-write' }),
  retryState: Object.freeze({ kind: 'retry-after-untracked-side-effect' }),
  normalizationStrategy: 'JSON clone for test-only snapshots; no production normalization implied',
});
