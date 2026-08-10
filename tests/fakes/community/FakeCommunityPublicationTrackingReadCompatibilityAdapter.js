const { fromLegacyPublicationRecord } = require('../../../src/application/community/communityPublicationStateMapper');

function createFakeCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData } = {}) {
  if (typeof readOnboardingData !== 'function') {
    throw new TypeError('CommunityPublicationTrackingReadCompatibilityAdapter requires readOnboardingData');
  }

  return {
    readTrackedMessage({ guildId, publication } = {}) {
      const data = readOnboardingData()[guildId] || {};
      const state = fromLegacyPublicationRecord(guildId, data);
      const trackedMessageId = publication === 'guide'
        ? state.guide.messageId || data.guideMessageId
        : state.roadmap.messageId || data.roadmapMessageId;
      return Object.freeze({ trackedMessageId });
    }
  };
}

module.exports = { createFakeCommunityPublicationTrackingReadCompatibilityAdapter };
