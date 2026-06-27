const adminButtons = require('./buttonHandlers/adminButtons');
const gameButtons = require('./buttonHandlers/gameButtons');
const panelButtons = require('./buttonHandlers/panelButtons');
const roleButtons = require('./buttonHandlers/roleButtons');
const voiceButtons = require('./buttonHandlers/voiceButtons');
const legacyDispatcher = require('../../legacy/interactions/legacyInteractionDispatcher');

const buttonHandlers = [
  roleButtons,
  gameButtons,
  voiceButtons,
  panelButtons,
  adminButtons
];

async function handleButtonInteraction(interaction) {
  const customId = interaction.customId || '';
  const handler = buttonHandlers.find((candidate) => candidate.matches(customId));
  if (handler) return handler.handle(interaction);
  return legacyDispatcher.execute(interaction);
}

module.exports = { handleButtonInteraction };
