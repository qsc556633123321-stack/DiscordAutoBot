const executor = require('../../adapters/legacy/legacyCommunityCommandExecutor');
const handler = require('./rebuild_server');
module.exports = { data: handler.data, execute: (interaction) => executor.executeLegacy('rebuildServer', interaction) };
