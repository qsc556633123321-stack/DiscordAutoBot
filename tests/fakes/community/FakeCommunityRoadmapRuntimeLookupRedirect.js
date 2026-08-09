const {
  RoadmapPublicationMessageLookupKind
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');
const {
  createCommunityRoadmapAdapterPairFeature
} = require('../../../src/composition/communityRoadmapAdapterPairFeature');

// Test-only model of the approved future lookup redirect. Mutation and persistence
// deliberately stay injected legacy operations.
function createFakeCommunityRoadmapRuntimeLookupRedirect({
  getOrCreateRoadmapChannel,
  readOnboardingData,
  fromLegacyPublicationRecord,
  buildRoadmapEmbed,
  saveOnboarding,
  createFeature = createCommunityRoadmapAdapterPairFeature
} = {}) {
  return {
    async setupRoadmapPanel(guild) {
      const channel = await getOrCreateRoadmapChannel(guild);
      const { lookupPort, getRetainedMessage } = createFeature().createAdapterPair({ ensuredChannel: channel });
      const data = readOnboardingData()[guild.id] || {};
      const publicationState = fromLegacyPublicationRecord(guild.id, data);
      const roadmapMessageId = publicationState.roadmap.messageId || data.roadmapMessageId;
      const payload = { embeds: [buildRoadmapEmbed()] };
      let message = null;

      if (roadmapMessageId) {
        const lookupResult = await lookupPort.lookupTrackedMessage({ messageId: roadmapMessageId });
        if (lookupResult.kind === RoadmapPublicationMessageLookupKind.Available) {
          message = getRetainedMessage();
          if (!message) throw new Error('Roadmap lookup Available result requires a retained message');
        }
      }

      if (message) await message.edit(payload);
      else message = await channel.send(payload);
      saveOnboarding(guild.id, {
        roadmapChannelId: channel.id,
        roadmapMessageId: message.id
      });
      return { channel, message };
    }
  };
}

module.exports = { createFakeCommunityRoadmapRuntimeLookupRedirect };
