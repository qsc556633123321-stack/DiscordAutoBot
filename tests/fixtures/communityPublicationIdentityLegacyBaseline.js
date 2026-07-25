module.exports = Object.freeze({
  guide: { channelName: '🧭｜伺服器導覽', record: { guideChannelId: 'guide-channel', guideMessageId: 'guide-message' } },
  roadmap: { channelName: '🚧｜社群開發日誌', record: { roadmapChannelId: 'roadmap-channel', roadmapMessageId: 'roadmap-message' } },
  states: ['missingRecord', 'wrongMessageId', 'wrongChannelId', 'deletedMessage', 'deletedChannel', 'duplicateMessages', 'duplicateChannels', 'swappedIds', 'sameIds', 'fetchPermissionError', 'transientError'],
  currentBehavior: {
    primaryMessageIdentity: 'persisted message ID',
    primaryChannelIdentity: 'exact channel name',
    secondaryValidation: 'not present',
    recovery: 'send when tracked fetch fails or record is missing',
    duplicateDetection: 'not present',
    idempotency: 'not present'
  }
});
