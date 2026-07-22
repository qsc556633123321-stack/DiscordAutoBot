// fallbackAllowed: controlled read bridge until the server-memory system has a dedicated store.
const { listChannelRules } = require('../../systems/serverMemory');

function listRules(guildId) {
  return listChannelRules(guildId);
}

module.exports = { listRules };
