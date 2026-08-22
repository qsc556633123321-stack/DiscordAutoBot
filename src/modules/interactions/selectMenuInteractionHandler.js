// fallbackAllowed: controlled legacy compatibility path
const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');
const gameRoleSelection = require('./selectHandlers/gameRoleSelectionSelectMenu');

async function handleSelectMenuInteraction(interaction) {
  if (gameRoleSelection.matches(interaction.customId)) return gameRoleSelection.handle(interaction);
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleSelectMenuInteraction };
