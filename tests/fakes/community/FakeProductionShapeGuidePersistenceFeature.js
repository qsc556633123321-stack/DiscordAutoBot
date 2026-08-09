const {
  mapGuidePersistenceRequestToGenericInput
} = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');

// Test-only production-shape candidate for the next Composition slice.
function createFakeProductionShapeGuidePersistenceFeature({ communityPublicationStateFeature } = {}) {
  return {
    persist(request) {
      return communityPublicationStateFeature.persistCommunityPublicationRecord.execute(
        mapGuidePersistenceRequestToGenericInput(request)
      );
    }
  };
}

module.exports = { createFakeProductionShapeGuidePersistenceFeature };
