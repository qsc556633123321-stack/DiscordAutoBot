const {
  createCommunityPublicationChannelTrackingReadResult
} = require('../../application/community/ports/CommunityPublicationChannelTrackingReadPort');

function assertOnboardingStateReader(onboardingStateReader) {
  if (!onboardingStateReader || typeof onboardingStateReader.readOnboardingState !== 'function') {
    throw new TypeError('CommunityPublicationChannelTrackingReadCompatibilityAdapter requires onboardingStateReader');
  }
}

function createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader } = {}) {
  assertOnboardingStateReader(onboardingStateReader);

  return {
    readTrackedChannel({ guildId } = {}) {
      const records = onboardingStateReader.readOnboardingState();
      const data = records[guildId] || {};
      return createCommunityPublicationChannelTrackingReadResult({
        trackedChannelId: data.guideChannelId
      });
    }
  };
}

module.exports = { createCommunityPublicationChannelTrackingReadCompatibilityAdapter };
