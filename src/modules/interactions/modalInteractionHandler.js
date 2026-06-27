const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');

async function handleModalInteraction(interaction) {
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleModalInteraction };

