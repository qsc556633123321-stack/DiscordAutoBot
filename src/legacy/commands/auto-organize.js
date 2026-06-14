const service = require('../../services/community/legacyAnalysisCommandService');
module.exports = { data: service.commands.autoOrganize.data, execute: (interaction) => service.execute('autoOrganize', interaction) };
