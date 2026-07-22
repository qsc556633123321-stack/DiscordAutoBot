function createListChannelRulesUseCase({ repository } = {}) {
  if (!repository) throw new Error('channelRuleRepository is required');
  return {
    execute({ guildId }) {
      return repository.listByGuild(guildId).slice(0, 25);
    }
  };
}

module.exports = { createListChannelRulesUseCase };
