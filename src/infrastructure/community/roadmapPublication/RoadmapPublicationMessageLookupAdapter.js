const {
  RoadmapPublicationMessageLookupKind,
  createRoadmapPublicationMessageAvailable,
  createRoadmapPublicationMessageUnavailable
} = require('../../../application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');

function assertResourceSession(resourceSession) {
  if (!resourceSession || typeof resourceSession.lookupTrackedMessage !== 'function') {
    throw new TypeError('RoadmapPublicationMessageLookupAdapter requires resourceSession.lookupTrackedMessage');
  }
}

function createRoadmapPublicationMessageLookupAdapter({ resourceSession } = {}) {
  assertResourceSession(resourceSession);

  return {
    async lookupTrackedMessage(request) {
      const result = await resourceSession.lookupTrackedMessage(request.messageId);
      if (result?.kind === RoadmapPublicationMessageLookupKind.Available) {
        return createRoadmapPublicationMessageAvailable({ messageId: result.messageId });
      }
      if (result?.kind === RoadmapPublicationMessageLookupKind.Unavailable) {
        return createRoadmapPublicationMessageUnavailable();
      }
      throw new Error('RoadmapPublicationMessageLookupAdapter received an unknown session result');
    }
  };
}

module.exports = { createRoadmapPublicationMessageLookupAdapter };
