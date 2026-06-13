const { fromThrowable, ok } = require('../../core/result');
const setupServerLegacy = require('../../legacy/commands/setupServerLegacy');
const setupTicketLegacy = require('../../legacy/commands/setupTicketLegacy');

async function invoke(handler, interaction, code) {
  try {
    await handler.execute(interaction);
    return ok();
  } catch (error) {
    return fromThrowable(error, code);
  }
}

module.exports = {
  setupServer: (interaction) => invoke(setupServerLegacy, interaction, 'SETUP_SERVER_FAILED'),
  setupTicket: (interaction) => invoke(setupTicketLegacy, interaction, 'SETUP_TICKET_FAILED')
};
