function createGuidePersistenceRequest({
  guildId,
  channelId,
  messageId,
  nativeTaskRecommendations,
  nativeTaskExcludedChannels
} = {}) {
  return Object.freeze({
    guildId,
    channelId,
    messageId,
    nativeTaskRecommendations,
    nativeTaskExcludedChannels
  });
}

function mapGuidePersistenceRequestToLegacyPatch(request) {
  return Object.freeze({
    guideChannelId: request.channelId,
    guideMessageId: request.messageId,
    nativeTaskRecommendations: request.nativeTaskRecommendations,
    nativeTaskExcludedChannels: request.nativeTaskExcludedChannels
  });
}

module.exports = { createGuidePersistenceRequest, mapGuidePersistenceRequestToLegacyPatch };
