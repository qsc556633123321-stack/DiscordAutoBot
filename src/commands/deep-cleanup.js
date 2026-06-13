const service = require('../services/community/legacyAnalysisCommandService');
module.exports = { data: service.commands.deepCleanup.data, execute: (interaction) => service.execute('deepCleanup', interaction) };
