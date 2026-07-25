module.exports = Object.freeze({
  guildId: 'guild-1',
  legacyRoot: Object.freeze({
    'guild-1': Object.freeze({ guideChannelId: 'guide-channel', guideMessageId: 'guide-message', roadmapChannelId: 'roadmap-channel', roadmapMessageId: 'roadmap-message', nativeTaskRecommendations: ['entry'], unknown: Object.freeze({ retained: true }) }),
    'guild-2': Object.freeze({ unknown: 'other-guild' })
  }),
  guideOnly: Object.freeze({ guildId: 'guild-1', guide: Object.freeze({ channelId: 'guide-next', messageId: 'guide-next-message' }), roadmap: Object.freeze({ channelId: null, messageId: null }) }),
  full: Object.freeze({ guildId: 'guild-1', guide: Object.freeze({ channelId: 'guide-next', messageId: 'guide-next-message' }), roadmap: Object.freeze({ channelId: 'roadmap-next', messageId: 'roadmap-next-message' }) })
});
