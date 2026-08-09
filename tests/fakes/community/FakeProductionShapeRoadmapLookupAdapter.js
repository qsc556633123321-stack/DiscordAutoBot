const {
  createRoadmapPublicationMessageAvailable,
  createRoadmapPublicationMessageUnavailable
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');

function createFakeProductionShapeRoadmapLookupAdapter({ resourceSession } = {}) {
  if (!resourceSession || typeof resourceSession.lookupTrackedMessage !== 'function') {
    throw new Error('RoadmapPublicationMessageLookupAdapter requires resourceSession.lookupTrackedMessage');
  }

  return {
    async lookupTrackedMessage(request) {
      const result = await resourceSession.lookupTrackedMessage(request.messageId);
      if (result?.kind === 'Available') {
        return createRoadmapPublicationMessageAvailable({ messageId: result.messageId });
      }
      if (result?.kind === 'Unavailable') {
        return createRoadmapPublicationMessageUnavailable();
      }
      throw new Error('RoadmapPublicationMessageLookupAdapter received an unknown session result');
    }
  };
}

module.exports = { createFakeProductionShapeRoadmapLookupAdapter };
