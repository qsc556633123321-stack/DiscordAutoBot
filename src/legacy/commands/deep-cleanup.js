const service = require('../../services/community/communityService');
const handler = require('./deep_cleanup');
module.exports = { data: handler.data, execute: (interaction) => service.executeLegacy('deepCleanup', interaction) };
