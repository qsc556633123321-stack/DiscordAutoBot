const service = require('../../services/community/communityService');
const handler = require('./ai_reorganize_server');
module.exports = { data: handler.data, execute: (interaction) => service.executeLegacy('aiReorganizeServer', interaction) };
