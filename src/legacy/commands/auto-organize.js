const executor = require('../../adapters/legacy/legacyCommunityCommandExecutor');
const handler = require('./auto_organize');
module.exports = { data: handler.data, execute: (interaction) => executor.executeLegacy('autoOrganize', interaction) };
