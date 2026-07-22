const { auditCommands } = require('../../../scripts/audit-commands');

function createCommandAuditGateway({ auditRunner = auditCommands } = {}) {
  return {
    audit() {
      return auditRunner();
    }
  };
}

const gateway = createCommandAuditGateway();

module.exports = { ...gateway, createCommandAuditGateway };
