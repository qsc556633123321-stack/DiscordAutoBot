function createGetChannelRulesForOrganizerUseCase({ channelRuleReader } = {}) {
  if (!channelRuleReader) throw new Error('channelRuleReader is required');

  return {
    execute({ guildId }) {
      if (!guildId) return [];
      const rules = channelRuleReader.listByGuild(guildId);
      return Array.isArray(rules) ? rules.map((rule) => ({ ...rule })) : [];
    }
  };
}

module.exports = { createGetChannelRulesForOrganizerUseCase };
