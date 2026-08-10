const {
  createCommunityPublicationTrackingReadResult,
  fromLegacyPublicationRecord
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');

function assertOnboardingStateReader(onboardingStateReader) {
  if (!onboardingStateReader || typeof onboardingStateReader.readOnboardingState !== 'function') {
    throw new TypeError('CommunityPublicationTrackingReadCompatibilityAdapter requires onboardingStateReader');
  }
}

function createFakeCommunityPublicationTrackingReadReaderAdapter({
  onboardingStateReader,
  publicationStateMapper = fromLegacyPublicationRecord
} = {}) {
  assertOnboardingStateReader(onboardingStateReader);

  return {
    readTrackedMessage({ guildId, publication } = {}) {
      const records = onboardingStateReader.readOnboardingState();
      const data = records[guildId] || {};
      const state = publicationStateMapper(guildId, data);
      const trackedMessageId = publication === 'guide'
        ? state.guide.messageId || data.guideMessageId
        : state.roadmap.messageId || data.roadmapMessageId;

      return createCommunityPublicationTrackingReadResult({ trackedMessageId });
    }
  };
}

module.exports = { createFakeCommunityPublicationTrackingReadReaderAdapter };
