const {
  createCommunityPublicationChannelTrackingReadResult
} = require('../../application/community/ports/CommunityPublicationChannelTrackingReadPort');

function assertReadOnboardingData(readOnboardingData) {
  if (typeof readOnboardingData !== 'function') {
    throw new TypeError('CommunityPublicationChannelTrackingReadCompatibilityAdapter requires readOnboardingData');
  }
}

function createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ readOnboardingData } = {}) {
  assertReadOnboardingData(readOnboardingData);

  return {
    readTrackedChannel({ guildId } = {}) {
      const records = readOnboardingData();
      const data = records[guildId] || {};
      return createCommunityPublicationChannelTrackingReadResult({
        trackedChannelId: data.guideChannelId
      });
    }
  };
}

module.exports = { createCommunityPublicationChannelTrackingReadCompatibilityAdapter };
