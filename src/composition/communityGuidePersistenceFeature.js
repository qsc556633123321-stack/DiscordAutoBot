const {
  mapGuidePersistenceRequestToGenericInput
} = require('../application/community/guidePublication/GuidePersistenceRequest');

function createCommunityGuidePersistenceFeature({ communityPublicationStateFeature } = {}) {
  return {
    persist(request) {
      return communityPublicationStateFeature.persistCommunityPublicationRecord.execute(
        mapGuidePersistenceRequestToGenericInput(request)
      );
    }
  };
}

module.exports = { createCommunityGuidePersistenceFeature };
