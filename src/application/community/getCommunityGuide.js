const { assertGuideContentReader } = require('./ports/guideContentReader');
const { assertGuideGuildFactsReader } = require('./ports/guideGuildFactsReader');
const { assertConciergeTextGenerator } = require('./ports/conciergeTextGenerator');
const { buildCommunityGuideViewModel } = require('../../domain/community/guideReadModel');

function createGetCommunityGuide({ guideContentReader, guideGuildFactsReader, conciergeTextGenerator, viewModelFactory = buildCommunityGuideViewModel } = {}) {
  const contentReader = assertGuideContentReader(guideContentReader);
  const guildFactsReader = assertGuideGuildFactsReader(guideGuildFactsReader);
  assertConciergeTextGenerator(conciergeTextGenerator);
  const textGenerator = conciergeTextGenerator;

  return {
    async execute({ guildId, guildName } = {}) {
      const [content, guildFacts] = await Promise.all([
        contentReader.readGuideContent(),
        guildFactsReader.readGuideGuildFacts(guildId)
      ]);
      const resolvedGuildFacts = { ...guildFacts, name: guildName || guildFacts?.name };
      const intro = await textGenerator.generate(
        'main_guide',
        { guildName: resolvedGuildFacts.name },
        content.fallbackIntro
      );
      return buildResult(viewModelFactory({ content, guildFacts: resolvedGuildFacts, intro }));
    }
  };
}

function buildResult(guide) {
  return { guide };
}

module.exports = { createGetCommunityGuide };
