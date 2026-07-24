const { createHelpMeStartRecommendation } = require('../../domain/community/helpMeStartRecommendation');
const { assertConciergeTextGenerator } = require('./ports/conciergeTextGenerator');
const { assertGuildChannelReader } = require('./ports/guildChannelReader');

const HELP_ME_START_FALLBACK = '我會建議你先領對身分組，再去目前語音房或找隊友大廳看看。';

function createGetHelpMeStartRecommendation({
  guildChannelReader,
  conciergeTextGenerator,
  recommendationFactory = createHelpMeStartRecommendation
} = {}) {
  assertGuildChannelReader(guildChannelReader);
  assertConciergeTextGenerator(conciergeTextGenerator);

  return {
    async execute({ guildId, guildName, answers } = {}) {
      const channels = await guildChannelReader.listTextChannels(guildId);
      const viewModel = recommendationFactory({ answers, channels });
      const description = await conciergeTextGenerator.generate('help_me_start', {
        guildName,
        ...viewModel.aiContext
      }, HELP_ME_START_FALLBACK);

      return { description, recommendation: viewModel.recommendation };
    }
  };
}

module.exports = { HELP_ME_START_FALLBACK, createGetHelpMeStartRecommendation };
