const { fromLegacyPublicationRecord } = require('../../../src/application/community/communityPublicationStateMapper');

function createFakeProductionShapeGuideTrackedStateRead({ readOnboardingData } = {}) {
  if (typeof readOnboardingData !== 'function') {
    throw new TypeError('FakeProductionShapeGuideTrackedStateRead requires readOnboardingData');
  }

  return {
    getTrackedPublicationMessageId({ guildId, publication } = {}) {
      const data = readOnboardingData()[guildId] || {};
      const state = fromLegacyPublicationRecord(guildId, data);
      if (publication === 'guide') return state.guide.messageId || data.guideMessageId;
      if (publication === 'roadmap') return state.roadmap.messageId || data.roadmapMessageId;
      throw new Error(`Unsupported publication: ${publication}`);
    }
  };
}

module.exports = { createFakeProductionShapeGuideTrackedStateRead };
