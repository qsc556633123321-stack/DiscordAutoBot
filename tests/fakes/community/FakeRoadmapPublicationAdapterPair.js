const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

function createFakeRoadmapPublicationAdapterPair({ ensuredChannel } = {}) {
  const resourceSession = createRoadmapPublicationResourceSession({ ensuredChannel });
  const lookupPort = createRoadmapPublicationMessageLookupAdapter({ resourceSession });

  return {
    lookupPort,
    getRetainedMessage() {
      return resourceSession.getRetainedMessage();
    }
  };
}

module.exports = { createFakeRoadmapPublicationAdapterPair };
