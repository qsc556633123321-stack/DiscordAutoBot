const service = require('../../services/community/communityService');
const handler = require('./rebuild_server');
module.exports = { data: handler.data, execute: (interaction) => service.executeLegacy('rebuildServer', interaction) };
