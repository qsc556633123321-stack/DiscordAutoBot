const executor = require('../../adapters/legacy/legacyCommunityCommandExecutor');
const handler = require('./deep_cleanup');
module.exports = { data: handler.data, execute: (interaction) => executor.executeLegacy('deepCleanup', interaction) };
