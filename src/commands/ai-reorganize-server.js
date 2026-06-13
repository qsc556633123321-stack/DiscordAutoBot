const service = require('../services/community/legacyAnalysisCommandService');
module.exports = { data: service.commands.aiReorganizeServer.data, execute: (interaction) => service.execute('aiReorganizeServer', interaction) };
