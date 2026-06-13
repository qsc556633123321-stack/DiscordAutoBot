const service = require('../services/community/legacyAnalysisCommandService');
module.exports = { data: service.commands.analyzeServer.data, execute: (interaction) => service.execute('analyzeServer', interaction) };
