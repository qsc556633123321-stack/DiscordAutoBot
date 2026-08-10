const {
  createCommunityPublicationChannelTrackingReadResult
} = require('./FakeCommunityPublicationChannelTrackingReadPort');

function createFakeCommunityPublicationChannelTrackingReadCompatibilityAdapter({ readOnboardingData } = {}) {
  if (typeof readOnboardingData !== 'function') {
    throw new TypeError('FakeCommunityPublicationChannelTrackingReadCompatibilityAdapter requires readOnboardingData');
  }

  return {
    readTrackedChannel({ guildId } = {}) {
      const records = readOnboardingData();
      const data = records[guildId] || {};
      return createCommunityPublicationChannelTrackingReadResult({ trackedChannelId: data.guideChannelId });
    }
  };
}

module.exports = { createFakeCommunityPublicationChannelTrackingReadCompatibilityAdapter };
