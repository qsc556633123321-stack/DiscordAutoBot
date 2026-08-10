const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');

function createFakeCommunityGuideTrackingReadRuntimeRedirect({ readOnboardingData } = {}) {
  const trackingReadPort = createCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData });

  return {
    async execute({ guildId, mode, lookup, mutate, persist } = {}) {
      const request = createCommunityPublicationTrackingReadRequest({ guildId, publication: 'guide' });
      const { trackedMessageId } = trackingReadPort.readTrackedMessage(request);
      const shouldLookup = Boolean(trackedMessageId) && mode !== 'force';
      if (shouldLookup) await lookup?.(trackedMessageId);
      await mutate?.({ trackedMessageId, lookupAttempted: shouldLookup });
      await persist?.();
      return Object.freeze({ trackedMessageId, lookupAttempted: shouldLookup });
    }
  };
}

module.exports = { createFakeCommunityGuideTrackingReadRuntimeRedirect };
