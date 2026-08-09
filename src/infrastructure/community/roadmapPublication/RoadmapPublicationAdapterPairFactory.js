const { createRoadmapPublicationResourceSession } = require('./RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageLookupAdapter } = require('./RoadmapPublicationMessageLookupAdapter');
const { createRoadmapPublicationMessageMutationAdapter } = require('./RoadmapPublicationMessageMutationAdapter');

function createRoadmapPublicationAdapterPair({ ensuredChannel } = {}) {
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

module.exports = { createRoadmapPublicationAdapterPair };
