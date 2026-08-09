const { createRoadmapPublicationResourceSession } = require('./RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageLookupAdapter } = require('./RoadmapPublicationMessageLookupAdapter');

function createRoadmapPublicationAdapterPair({ ensuredChannel } = {}) {
  const resourceSession = createRoadmapPublicationResourceSession({ ensuredChannel });
  const lookupPort = createRoadmapPublicationMessageLookupAdapter({ resourceSession });

  return {
    lookupPort,
    getRetainedMessage() {
      return resourceSession.getRetainedMessage();
    }
  };
}

module.exports = { createRoadmapPublicationAdapterPair };
