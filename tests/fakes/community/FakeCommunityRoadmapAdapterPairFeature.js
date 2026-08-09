const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

function createFakeCommunityRoadmapAdapterPairFeature({ createAdapterPair = createRoadmapPublicationAdapterPair } = {}) {
  if (typeof createAdapterPair !== 'function') {
    throw new TypeError('CommunityRoadmapAdapterPairFeature requires createAdapterPair');
  }

  return {
    createAdapterPair(input) {
      return createAdapterPair(input);
    }
  };
}

module.exports = { createFakeCommunityRoadmapAdapterPairFeature };
