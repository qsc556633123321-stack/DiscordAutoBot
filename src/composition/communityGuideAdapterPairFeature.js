const { createGuidePublicationAdapterPair } = require('../infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

function createCommunityGuideAdapterPairFeature({ createAdapterPair = createGuidePublicationAdapterPair } = {}) {
  if (typeof createAdapterPair !== 'function') {
    throw new TypeError('CommunityGuideAdapterPairFeature requires createAdapterPair');
  }

  return { createAdapterPair };
}

module.exports = { createCommunityGuideAdapterPairFeature };
