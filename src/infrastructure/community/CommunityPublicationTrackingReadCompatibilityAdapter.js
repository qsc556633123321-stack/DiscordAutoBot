const {
  createCommunityPublicationTrackingReadResult,
  fromLegacyPublicationRecord
} = require('../../application/community/ports/CommunityPublicationTrackingReadPort');

function assertReadOnboardingData(readOnboardingData) {
  if (typeof readOnboardingData !== 'function') {
    throw new TypeError('CommunityPublicationTrackingReadCompatibilityAdapter requires readOnboardingData');
  }
}

function assertPublicationStateMapper(publicationStateMapper) {
  if (typeof publicationStateMapper !== 'function') {
    throw new TypeError('CommunityPublicationTrackingReadCompatibilityAdapter requires publicationStateMapper');
  }
}

function createCommunityPublicationTrackingReadCompatibilityAdapter({
  readOnboardingData,
  publicationStateMapper = fromLegacyPublicationRecord
} = {}) {
  assertReadOnboardingData(readOnboardingData);
  assertPublicationStateMapper(publicationStateMapper);

  return {
    readTrackedMessage({ guildId, publication } = {}) {
      const records = readOnboardingData();
      const data = records[guildId] || {};
      const state = publicationStateMapper(guildId, data);
      const trackedMessageId = publication === 'guide'
        ? state.guide.messageId || data.guideMessageId
        : state.roadmap.messageId || data.roadmapMessageId;

      return createCommunityPublicationTrackingReadResult({ trackedMessageId });
    }
  };
}

module.exports = { createCommunityPublicationTrackingReadCompatibilityAdapter };
