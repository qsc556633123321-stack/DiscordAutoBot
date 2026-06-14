const service = require('../../services/community/legacyAnalysisCommandService');
module.exports = { data: service.commands.rebuildServer.data, execute: (interaction) => service.execute('rebuildServer', interaction) };
