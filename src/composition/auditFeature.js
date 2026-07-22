const { createRunCommandAuditUseCase } = require('../application/audit/runCommandAuditUseCase');
const commandAuditGateway = require('../infrastructure/project/commandAuditGateway');

function createAuditFeature({ gateway = commandAuditGateway } = {}) {
  return {
    runCommandAudit: createRunCommandAuditUseCase({ gateway })
  };
}

module.exports = { createAuditFeature };
