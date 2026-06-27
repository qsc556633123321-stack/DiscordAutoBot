const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');

async function handleButtonInteraction(interaction) {
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleButtonInteraction };

