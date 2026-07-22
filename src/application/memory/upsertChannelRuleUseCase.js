const { createChannelRule, updateChannelRule } = require('../../domain/memory/channelRulePolicy');

function createUpsertChannelRuleUseCase({
  repository,
  clock = () => new Date().toISOString()
} = {}) {
  if (!repository) throw new Error('channelRuleRepository is required');
  return {
    execute({ guildId, keyword, category, weight }) {
      const existing = repository.findByKeyword(guildId, keyword);
      const timestamp = clock();
      const result = existing
        ? updateChannelRule(existing, { keyword, category, weight }, timestamp)
        : createChannelRule({ keyword, category, weight }, timestamp);
      if (!result.ok) return result;
      return { ...result, data: repository.upsert(guildId, result.data) };
    }
  };
}

module.exports = { createUpsertChannelRuleUseCase };
