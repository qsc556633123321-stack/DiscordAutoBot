const legacy = require('../legacy/commands/setupTicketLegacy');
const setupService = require('../services/community/legacySetupService');

module.exports = {
  data: legacy.data,
  async execute(interaction) {
    const result = await setupService.setupTicket(interaction);
    if (!result.ok) console.error('[setup-ticket]', result.error);
  }
};
