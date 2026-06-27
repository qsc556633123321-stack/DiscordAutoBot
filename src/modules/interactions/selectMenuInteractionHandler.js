const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');

async function handleSelectMenuInteraction(interaction) {
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleSelectMenuInteraction };

