const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');

function createFakeCommunityRoadmapTrackingReadRuntimeRedirect({ readOnboardingData } = {}) {
  const trackingReadPort = createCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData });

  return {
    async execute({ guildId, lookup, mutate, persist } = {}) {
      const request = createCommunityPublicationTrackingReadRequest({ guildId, publication: 'roadmap' });
      const { trackedMessageId } = trackingReadPort.readTrackedMessage(request);
      const shouldLookup = Boolean(trackedMessageId);
      if (shouldLookup) await lookup?.(trackedMessageId);
      await mutate?.({ trackedMessageId, lookupAttempted: shouldLookup });
      await persist?.();
      return Object.freeze({ trackedMessageId, lookupAttempted: shouldLookup });
    }
  };
}

module.exports = { createFakeCommunityRoadmapTrackingReadRuntimeRedirect };
