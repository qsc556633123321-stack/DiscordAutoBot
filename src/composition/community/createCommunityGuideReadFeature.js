const { createGetCommunityGuide } = require('../../application/community/getCommunityGuide');
const { createCommunityGuideContentReader } = require('../../infrastructure/community/communityGuideContentReader');
const { renderCommunityGuide } = require('../../presentation/community/communityGuideRenderer');

function createCommunityGuideReadFeature({ guideContentReader, conciergeTextGenerator } = {}) {
  const contentReader = guideContentReader || createCommunityGuideContentReader();
  const textGenerator = conciergeTextGenerator;

  return {
    getCommunityGuide: createGetCommunityGuide({
      guideContentReader: contentReader,
      conciergeTextGenerator: textGenerator
    })
  };
}

function createCommunityGuideReadCompatibilityAdapter(dependencies = {}) {
  const feature = createCommunityGuideReadFeature(dependencies);

  return {
    async buildPayload() {
      const { guild } = dependencies;
      const { guide } = await feature.getCommunityGuide.execute({ guildName: guild.name });
      return renderCommunityGuide(guide);
    }
  };
}

module.exports = {
  createCommunityGuideReadCompatibilityAdapter,
  createCommunityGuideReadFeature
};
