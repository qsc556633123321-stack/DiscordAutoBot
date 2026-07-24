const { assertGuideContentReader } = require('./ports/guideContentReader');
const { assertConciergeTextGenerator } = require('./ports/conciergeTextGenerator');
const { buildCommunityGuideViewModel } = require('../../domain/community/guideReadModel');

function createGetCommunityGuide({ guideContentReader, conciergeTextGenerator, viewModelFactory = buildCommunityGuideViewModel } = {}) {
  const contentReader = assertGuideContentReader(guideContentReader);
  assertConciergeTextGenerator(conciergeTextGenerator);
  const textGenerator = conciergeTextGenerator;

  return {
    async execute({ guildName } = {}) {
      const content = await contentReader.readGuideContent();
      const intro = await textGenerator.generate(
        'main_guide',
        { guildName },
        content.fallbackIntro
      );
      return buildResult(viewModelFactory({ content, guildName, intro }));
    }
  };
}

function buildResult(guide) {
  return { guide };
}

module.exports = { createGetCommunityGuide };
