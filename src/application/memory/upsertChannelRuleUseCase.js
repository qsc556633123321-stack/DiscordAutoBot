const { createChannelRule, updateChannelRule } = require('../../domain/memory/channelRulePolicy');
const { createJsonChannelRuleRepository } = require('../../infrastructure/storage/jsonChannelRuleRepository');

function createUpsertChannelRuleUseCase({
  repository = createJsonChannelRuleRepository(),
  clock = () => new Date().toISOString()
} = {}) {
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
