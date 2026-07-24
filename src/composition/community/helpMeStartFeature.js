const { createGetHelpMeStartRecommendation } = require('../../application/community/getHelpMeStartRecommendation');
const { createDiscordGuildChannelReader } = require('../../infrastructure/community/discordGuildChannelReader');
const { createLegacyConciergeTextGenerator } = require('../../infrastructure/community/legacyConciergeTextGenerator');

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

module.exports = { createHelpMeStartFeature };
