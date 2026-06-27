const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');

async function handleSlashInteraction(interaction) {
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleSlashInteraction };

