const { createCommunityPublicationStateFeature } = require('../../../src/composition/communityPublicationStateFeature');

function createFakeDefaultCommunityPublicationPersistenceFeature(dependencies = {}) {
  return createCommunityPublicationStateFeature(dependencies);
}

module.exports = { createFakeDefaultCommunityPublicationPersistenceFeature };
