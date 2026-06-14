const service = require('../../services/community/communityService');
const handler = require('./plan_cleanup');
module.exports = { data: handler.data, execute: (interaction) => service.executeLegacy('planCleanup', interaction) };
