const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('./createCommunityGuideMutationHarness');

async function withCommunityRoadmapLookupRuntime(input = {}, run) {
  const { roadmapMessageId, fetchResult, rejection, createPair, writeFails = false } = input;
  const hasRejection = Object.prototype.hasOwnProperty.call(input, 'rejection');
  const hasFetchResult = Object.prototype.hasOwnProperty.call(input, 'fetchResult');
  const featurePath = require.resolve('../../src/composition/communityRoadmapAdapterPairFeature');
  const runtimePath = require.resolve('../../src/systems/communityConcierge');
  const originalFeature = require(featurePath);
  const metrics = { pairInputs: [], lookupCalls: 0, getterCalls: 0 };
  if (createPair) {
    require.cache[featurePath].exports = {
      createCommunityRoadmapAdapterPairFeature() {
        return {
          createAdapterPair(input) {
            metrics.pairInputs.push(input);
            return createPair(input.ensuredChannel, metrics);
          }
        };
      }
    };
    delete require.cache[runtimePath];
  }
  try {
    return await withOnboardingFile({
    initial: { 'guild-1': roadmapMessageId === undefined ? {} : { roadmapMessageId } },
    writeFails
    }, async ({ log, getState }) => {
      const concierge = require(runtimePath);
      const existing = hasFetchResult ? fetchResult : createMessage(roadmapMessageId || 'tracked', log, {}, 'roadmap');
      const roadmap = createTextChannel({
        id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, label: 'roadmap'
      });
      roadmap.messages.fetch = async (messageId) => {
        log.calls.push('roadmap.message.fetch');
        log.fetchArgs = [...(log.fetchArgs || []), messageId];
        if (hasRejection) throw rejection;
        return existing;
      };
      const guild = createGuild({
        guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
        log, behavior: { categoryExists: true }, existingRoadmap: roadmap
      });
      return run({ concierge, guild, roadmap, log, getState, metrics });
    });
  } finally {
    if (createPair) {
      delete require.cache[runtimePath];
      require.cache[featurePath].exports = originalFeature;
    }
  }
}

function createCompatiblePair(channel, metrics) {
  let retainedMessage = null;
  return {
    lookupPort: {
      async lookupTrackedMessage({ messageId }) {
        metrics.lookupCalls += 1;
        try {
          retainedMessage = await channel.messages.fetch(messageId);
          return retainedMessage ? { kind: 'Available', messageId } : { kind: 'Unavailable' };
        } catch (_) {
          retainedMessage = null;
          return { kind: 'Unavailable' };
        }
      }
    },
    getRetainedMessage() { metrics.getterCalls += 1; return retainedMessage; }
  };
}

module.exports = { withCommunityRoadmapLookupRuntime, createCompatiblePair };
