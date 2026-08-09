const {
  mapRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

function createFakeProductionShapeRoadmapPersistenceFeature({ communityPublicationStateFeature } = {}) {
  return {
    persist(request) {
      return communityPublicationStateFeature.persistCommunityPublicationRecord.execute(
        mapRoadmapPublicationPersistenceRequestToGenericInput(request)
      );
    }
  };
}

module.exports = { createFakeProductionShapeRoadmapPersistenceFeature };
