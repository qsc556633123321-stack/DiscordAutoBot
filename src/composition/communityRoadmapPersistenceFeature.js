const {
  mapRoadmapPublicationPersistenceRequestToGenericInput
} = require('../application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

function createCommunityRoadmapPersistenceFeature({ communityPublicationStateFeature } = {}) {
  return {
    persist(request) {
      return communityPublicationStateFeature
        .persistCommunityPublicationRecord
        .execute(mapRoadmapPublicationPersistenceRequestToGenericInput(request));
    }
  };
}

module.exports = { createCommunityRoadmapPersistenceFeature };
