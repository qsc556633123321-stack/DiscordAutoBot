const serverMemoryReadGateway = require('../../infrastructure/storage/serverMemoryReadGateway');

function createListChannelRulesUseCase({ gateway = serverMemoryReadGateway } = {}) {
  return {
    execute({ guildId }) {
      return gateway.listRules(guildId).slice(0, 25);
    }
  };
}

module.exports = { createListChannelRulesUseCase };
