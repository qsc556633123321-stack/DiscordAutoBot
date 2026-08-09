function createRoadmapPublicationPersistenceRequest({ guildId, channelId, messageId } = {}) {
  return Object.freeze({ guildId, channelId, messageId });
}

function mapRoadmapPublicationPersistenceRequestToGenericInput(request) {
  return Object.freeze({
    guildId: request.guildId,
    patch: Object.freeze({
      roadmapChannelId: request.channelId,
      roadmapMessageId: request.messageId
    })
  });
}

module.exports = {
  createRoadmapPublicationPersistenceRequest,
  mapRoadmapPublicationPersistenceRequestToGenericInput
};
