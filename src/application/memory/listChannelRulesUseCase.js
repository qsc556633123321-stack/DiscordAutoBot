const { createJsonChannelRuleRepository } = require('../../infrastructure/storage/jsonChannelRuleRepository');

function createListChannelRulesUseCase({ repository = createJsonChannelRuleRepository() } = {}) {
  return {
    execute({ guildId }) {
      return repository.listByGuild(guildId).slice(0, 25);
    }
  };
}

module.exports = { createListChannelRulesUseCase };
