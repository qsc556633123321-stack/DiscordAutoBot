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

function mapGuidePersistenceRequestToGenericInput(request) {
  return Object.freeze({
    guildId: request.guildId,
    patch: Object.freeze({
      guideChannelId: request.channelId,
      guideMessageId: request.messageId,
      nativeTaskRecommendations: request.nativeTaskRecommendations,
      nativeTaskExcludedChannels: request.nativeTaskExcludedChannels
    })
  });
}

module.exports = {
  createGuidePersistenceRequest,
  mapGuidePersistenceRequestToGenericInput
};
