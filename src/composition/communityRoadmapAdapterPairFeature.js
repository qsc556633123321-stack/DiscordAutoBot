const {
  createRoadmapPublicationAdapterPair
} = require('../infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

function createCommunityRoadmapAdapterPairFeature({
  createAdapterPair = createRoadmapPublicationAdapterPair
} = {}) {
  if (typeof createAdapterPair !== 'function') {
    throw new TypeError('CommunityRoadmapAdapterPairFeature requires createAdapterPair');
  }

  return {
    createAdapterPair(input) {
      return createAdapterPair(input);
    }
  };
}

module.exports = { createCommunityRoadmapAdapterPairFeature };
