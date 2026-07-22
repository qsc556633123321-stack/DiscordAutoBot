const { auditCommands } = require('../../../scripts/audit-commands');

function audit() {
  return auditCommands();
}

module.exports = { audit };
