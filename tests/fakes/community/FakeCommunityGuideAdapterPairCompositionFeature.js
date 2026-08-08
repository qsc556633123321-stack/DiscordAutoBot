const { createGuidePublicationAdapterPair } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

function createFakeCommunityGuideAdapterPairCompositionFeature({ createAdapterPair = createGuidePublicationAdapterPair } = {}) {
  if (typeof createAdapterPair !== 'function') {
    throw new TypeError('CommunityGuideAdapterPairCompositionFeature requires createAdapterPair');
  }
  return { createAdapterPair };
}

module.exports = { createFakeCommunityGuideAdapterPairCompositionFeature };
