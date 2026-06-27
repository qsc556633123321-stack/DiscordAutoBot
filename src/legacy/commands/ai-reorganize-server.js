const executor = require('../../adapters/legacy/legacyCommunityCommandExecutor');
const handler = require('./ai_reorganize_server');
module.exports = { data: handler.data, execute: (interaction) => executor.executeLegacy('aiReorganizeServer', interaction) };
