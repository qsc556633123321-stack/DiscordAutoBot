const service = require('../../services/community/legacyAnalysisCommandService');
module.exports = { data: service.commands.planCleanup.data, execute: (interaction) => service.execute('planCleanup', interaction) };
