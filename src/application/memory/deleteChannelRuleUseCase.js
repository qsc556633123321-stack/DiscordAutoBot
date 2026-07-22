const { fail, ok } = require('../../core/result');
const { normalizeKeyword } = require('../../domain/memory/channelRule');
const { createJsonChannelRuleRepository } = require('../../infrastructure/storage/jsonChannelRuleRepository');

function createDeleteChannelRuleUseCase({ repository = createJsonChannelRuleRepository() } = {}) {
  return {
    execute({ guildId, keyword }) {
      const normalizedKeyword = normalizeKeyword(keyword);
      if (!normalizedKeyword) return fail('CHANNEL_RULE_KEYWORD_REQUIRED', 'Keyword is required.');
      return ok({ deleted: repository.deleteByKeyword(guildId, normalizedKeyword) });
    }
  };
}

module.exports = { createDeleteChannelRuleUseCase };
