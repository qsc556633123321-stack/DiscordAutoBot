const service = require('../../services/community/communityService');
const handler = require('./auto_organize');
module.exports = { data: handler.data, execute: (interaction) => service.executeLegacy('autoOrganize', interaction) };
