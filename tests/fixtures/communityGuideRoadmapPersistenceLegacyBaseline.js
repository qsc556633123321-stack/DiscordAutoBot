module.exports = Object.freeze({
  filePath: 'src/data/onboarding-flows.json',
  encoding: 'utf8',
  formatting: { indentation: 2, trailingNewline: true, synchronous: true, atomic: false },
  fields: {
    guide: ['guideChannelId', 'guideMessageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels', 'updatedAt'],
    roadmap: ['roadmapChannelId', 'roadmapMessageId', 'updatedAt'],
    nativeOnboarding: ['nativeTaskRecommendations', 'nativeTaskExcludedChannels']
  },
  records: {
    emptyRoot: {},
    unrelatedGuild: { 'guild-other': { unknown: { keep: true } } },
    guideOnly: { 'guild-1': { guideChannelId: 'guide-channel', guideMessageId: 'guide-message', unknown: 'keep' } },
    roadmapOnly: { 'guild-1': { roadmapChannelId: 'roadmap-channel', roadmapMessageId: 'roadmap-message', unknown: 'keep' } },
    mixed: { 'guild-1': { guideChannelId: 'guide-channel', guideMessageId: 'guide-message', roadmapChannelId: 'roadmap-channel', roadmapMessageId: 'roadmap-message', nativeTaskRecommendations: ['entry'], unknown: { preserve: true } } },
    malformed: '{not json',
    emptyFile: ''
  },
  patches: {
    guide: { guideChannelId: 'guide-next', guideMessageId: 'guide-next-message', nativeTaskRecommendations: ['entry'], nativeTaskExcludedChannels: ['voice'] },
    roadmap: { roadmapChannelId: 'roadmap-next', roadmapMessageId: 'roadmap-next-message' }
  },
  dynamicFields: ['updatedAt', 'messageId', 'channelId']
});
