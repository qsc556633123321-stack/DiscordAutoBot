const { createGetCommunityGuide } = require('../../application/community/getCommunityGuide');
const { createGetCommunityGuideStatus } = require('../../application/community/getCommunityGuideStatus');
const { createCommunityGuideContentReader } = require('../../infrastructure/community/communityGuideContentReader');
const { createDiscordGuideGuildFactsReader } = require('../../infrastructure/community/discordGuideGuildFactsReader');
const { createJsonGuideStatusReader } = require('../../infrastructure/community/jsonGuideStatusReader');
const { renderCommunityGuide } = require('../../presentation/community/communityGuideRenderer');

function createCommunityGuideReadFeature({ guild, guideContentReader, guideStatusReader, guideGuildFactsReader, conciergeTextGenerator } = {}) {
  const guildFactsReader = guideGuildFactsReader || createDiscordGuideGuildFactsReader({ guildResolver: () => guild });
  const contentReader = guideContentReader || createCommunityGuideContentReader();
  const statusReader = guideStatusReader || createJsonGuideStatusReader();
  const textGenerator = conciergeTextGenerator;

  return {
    getCommunityGuide: createGetCommunityGuide({
      guideContentReader: contentReader,
      guideGuildFactsReader: guildFactsReader,
      conciergeTextGenerator: textGenerator
    }),
    getCommunityGuideStatus: createGetCommunityGuideStatus({
      guideStatusReader: statusReader,
      guideGuildFactsReader: guildFactsReader
    })
  };
}

function createCommunityGuideReadCompatibilityAdapter(dependencies = {}) {
  const feature = createCommunityGuideReadFeature(dependencies);

  return {
    async buildPayload() {
      const { guild } = dependencies;
      const { guide } = await feature.getCommunityGuide.execute({ guildId: guild.id, guildName: guild.name });
      return renderCommunityGuide(guide);
    }
  };
}

module.exports = {
  createCommunityGuideReadCompatibilityAdapter,
  createCommunityGuideReadFeature
};
