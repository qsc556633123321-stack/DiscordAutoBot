// Legacy slash-command compatibility wrapper. Keep this file for the deployed alias.
const command = require('../../presentation/commands/forgetChannelRuleCommand');

module.exports = { data: command.data, execute: command.execute };
