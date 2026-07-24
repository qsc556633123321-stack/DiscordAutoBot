const { assertGuideGuildFactsReader } = require('./ports/guideGuildFactsReader');
const { assertGuideStatusReader } = require('./ports/guideStatusReader');
const { buildCommunityGuideStatusViewModel } = require('../../domain/community/guideReadModel');

function createGetCommunityGuideStatus({ guideStatusReader, guideGuildFactsReader, viewModelFactory = buildCommunityGuideStatusViewModel } = {}) {
  const statusReader = assertGuideStatusReader(guideStatusReader);
  const guildFactsReader = assertGuideGuildFactsReader(guideGuildFactsReader);

  return {
    async execute({ guildId } = {}) {
      const [status, guildFacts] = await Promise.all([
        statusReader.readGuideStatus(guildId),
        guildFactsReader.readGuideGuildFacts(guildId)
      ]);
      return { status: viewModelFactory({ status, guildFacts }) };
    }
  };
}

module.exports = { createGetCommunityGuideStatus };
