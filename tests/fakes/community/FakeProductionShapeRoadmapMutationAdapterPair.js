const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');
const { createRoadmapPublicationMessageMutationAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter');

function createFakeProductionShapeRoadmapMutationAdapterPair({ ensuredChannel } = {}) {
  const resourceSession = createRoadmapPublicationResourceSession({ ensuredChannel });
  const lookupPort = createRoadmapPublicationMessageLookupAdapter({ resourceSession });
  const mutationPort = createRoadmapPublicationMessageMutationAdapter({ resourceSession });

  return {
    lookupPort,
    mutationPort,
    getRetainedMessage() {
      return resourceSession.getRetainedMessage();
    }
  };
}

module.exports = { createFakeProductionShapeRoadmapMutationAdapterPair };
