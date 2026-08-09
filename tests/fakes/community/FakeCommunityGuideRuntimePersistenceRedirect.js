const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');
const { createCommunityGuidePersistenceFeature } = require('../../../src/composition/communityGuidePersistenceFeature');
const { createCommunityPublicationStateFeature } = require('../../../src/composition/communityPublicationStateFeature');

// Test-only future redirect seam; it models only post-mutation persistence.
function createFakeCommunityGuideRuntimePersistenceRedirect({
  createGenericFeature = createCommunityPublicationStateFeature,
  createGuideFeature = createCommunityGuidePersistenceFeature,
  filePath,
  dataDirectory
} = {}) {
  return {
    persistAfterGuideMutation({ guild, channel, message, nativeTaskRecommendations, nativeTaskExcludedChannels } = {}) {
      const genericFeature = createGenericFeature({ filePath, dataDirectory });
      const guideFeature = createGuideFeature({ communityPublicationStateFeature: genericFeature });
      guideFeature.persist(createGuidePersistenceRequest({
        guildId: guild.id,
        channelId: channel.id,
        messageId: message.id,
        nativeTaskRecommendations,
        nativeTaskExcludedChannels
      }));
    }
  };
}

module.exports = { createFakeCommunityGuideRuntimePersistenceRedirect };
