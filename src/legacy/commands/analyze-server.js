const service = require('../../services/community/communityService');
const handler = require('./analyze_server');
module.exports = { data: handler.data, execute: (interaction) => service.executeLegacy('analyzeServer', interaction) };
