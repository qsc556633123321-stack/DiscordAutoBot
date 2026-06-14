const legacy = require('../../legacy/commands/setupServerLegacy');
const setupService = require('../../services/community/legacySetupService');

module.exports = {
  data: legacy.data,
  async execute(interaction) {
    const result = await setupService.setupServer(interaction);
    if (!result.ok) console.error('[setup-server]', result.error);
  }
};
