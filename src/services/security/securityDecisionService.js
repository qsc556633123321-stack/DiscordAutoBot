const { updateLinkGuardSettings } = require('./linkGuardService');

function enableLinkGuardForSafeMode(guildId) {
  return updateLinkGuardSettings(guildId, { enabled: true });
}

module.exports = {
  enableLinkGuardForSafeMode
};
