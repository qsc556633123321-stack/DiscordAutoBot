const {
  createRoadmapPublicationPersistenceRequest
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');
const {
  createCommunityRoadmapPersistenceFeature
} = require('../../../src/composition/communityRoadmapPersistenceFeature');

function createFakeCommunityRoadmapRuntimePersistenceRedirect({ communityPublicationStateFeature } = {}) {
  const communityRoadmapPersistenceFeature = createCommunityRoadmapPersistenceFeature({
    communityPublicationStateFeature
  });

  function persistAfterRoadmapMutation({ guild, channel, message }) {
    const request = createRoadmapPublicationPersistenceRequest({
      guildId: guild.id,
      channelId: channel.id,
      messageId: message.id
    });
    communityRoadmapPersistenceFeature.persist(request);
    return { channel, message };
  }

  return { persistAfterRoadmapMutation };
}

module.exports = { createFakeCommunityRoadmapRuntimePersistenceRedirect };
