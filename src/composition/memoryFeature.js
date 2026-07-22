const { createDeleteChannelRuleUseCase } = require('../application/memory/deleteChannelRuleUseCase');
const { createGetChannelRulesForOrganizerUseCase } = require('../application/memory/getChannelRulesForOrganizerUseCase');
const { createListChannelRulesUseCase } = require('../application/memory/listChannelRulesUseCase');
const { createUpsertChannelRuleUseCase } = require('../application/memory/upsertChannelRuleUseCase');
const { createJsonChannelRuleRepository } = require('../infrastructure/storage/jsonChannelRuleRepository');

function createMemoryFeature({ repository, clock } = {}) {
  const channelRuleRepository = repository || createJsonChannelRuleRepository();
  const useCaseOptions = { repository: channelRuleRepository };

  return {
    listChannelRules: createListChannelRulesUseCase(useCaseOptions),
    upsertChannelRule: createUpsertChannelRuleUseCase({ ...useCaseOptions, ...(clock ? { clock } : {}) }),
    deleteChannelRule: createDeleteChannelRuleUseCase(useCaseOptions),
    getChannelRulesForOrganizer: createGetChannelRulesForOrganizerUseCase({ channelRuleReader: channelRuleRepository })
  };
}

module.exports = { createMemoryFeature };
