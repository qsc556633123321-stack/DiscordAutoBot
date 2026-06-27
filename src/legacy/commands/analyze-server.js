const executor = require('../../adapters/legacy/legacyCommunityCommandExecutor');
const handler = require('./analyze_server');
module.exports = { data: handler.data, execute: (interaction) => executor.executeLegacy('analyzeServer', interaction) };
