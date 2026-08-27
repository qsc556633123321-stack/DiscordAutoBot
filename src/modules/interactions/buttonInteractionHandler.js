// fallbackAllowed: controlled legacy compatibility path
const adminButtons = require('./buttonHandlers/adminButtons');
const communityConciergeButtons = require('./buttonHandlers/communityConciergeButtons');
const gameButtons = require('./buttonHandlers/gameButtons');
const panelButtons = require('./buttonHandlers/panelButtons');
const roleButtons = require('./buttonHandlers/roleButtons');
const voiceButtons = require('./buttonHandlers/voiceButtons');
const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');
const { getLegacyMutationOperationFromCustomId } = require('../../application/community/serverGovernanceLegacyMutationPolicy');
const { guardLegacyMutationInteraction } = require('../commands/serverGovernanceLegacyMutationGuard');

const buttonHandlers = [
  communityConciergeButtons,
  roleButtons,
  gameButtons,
  voiceButtons,
  panelButtons,
  adminButtons
];

async function handleButtonInteraction(interaction) {
  const customId = interaction.customId || '';
  if (await guardLegacyMutationInteraction(interaction, getLegacyMutationOperationFromCustomId(customId))) return null;
  const handler = buttonHandlers.find((candidate) => candidate.matches(customId));
  if (handler) return handler.handle(interaction);
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleButtonInteraction };
