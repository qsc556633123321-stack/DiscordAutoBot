const executor = require('../../adapters/legacy/legacyCommunityCommandExecutor');
const handler = require('./plan_cleanup');
module.exports = { data: handler.data, execute: (interaction) => executor.executeLegacy('planCleanup', interaction) };
