const { createGetHelpMeStartRecommendation } = require('../../application/community/getHelpMeStartRecommendation');
const { createDiscordGuildChannelReader } = require('../../infrastructure/community/discordGuildChannelReader');
const { createLegacyConciergeTextGenerator } = require('../../adapters/legacy/legacyConciergeTextGenerator');
const { createHelpMeStartEmbed } = require('../../presentation/community/helpMeStartEmbed');

function createHelpMeStartFeature({ guild, guildChannelReader, conciergeTextGenerator } = {}) {
  const reader = guildChannelReader || createDiscordGuildChannelReader({ guildResolver: () => guild });
  const textGenerator = conciergeTextGenerator || createLegacyConciergeTextGenerator();

  return {
    getHelpMeStartRecommendation: createGetHelpMeStartRecommendation({
      guildChannelReader: reader,
      conciergeTextGenerator: textGenerator
    })
  };
}

function createHelpMeStartCompatibilityAdapter(dependencies = {}) {
  const feature = createHelpMeStartFeature(dependencies);

  return {
    async buildEmbed(answers) {
      const { guild } = dependencies;
      const result = await feature.getHelpMeStartRecommendation.execute({
        guildId: guild.id,
        guildName: guild.name,
        answers
      });
      return createHelpMeStartEmbed(result);
    }
  };
}

module.exports = {
  createHelpMeStartFeature,
  createHelpMeStartCompatibilityAdapter
};
