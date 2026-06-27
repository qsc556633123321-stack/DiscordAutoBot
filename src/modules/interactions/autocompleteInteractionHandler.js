// fallbackAllowed: controlled legacy compatibility path
const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');

async function handleAutocompleteInteraction(interaction) {
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleAutocompleteInteraction };
