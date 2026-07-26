module.exports = Object.freeze({
  guildId: 'guild-read',
  missingRecord: undefined,
  emptyRecord: Object.freeze({}),
  validRecord: Object.freeze({ guideMessageId: 'guide-message', roadmapMessageId: 'roadmap-message', nativeTaskRecommendations: Object.freeze(['welcome']), unknown: Object.freeze({ retained: true }) }),
  nullRecord: null,
  numericGuideRecord: Object.freeze({ guideMessageId: 42 }),
  objectGuideRecord: Object.freeze({ guideMessageId: Object.freeze({ id: 'bad' }) }),
  emptyGuideRecord: Object.freeze({ guideMessageId: '' }),
});
