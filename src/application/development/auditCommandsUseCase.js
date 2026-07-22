const commandAuditGateway = require('../../infrastructure/project/commandAuditGateway');

function createAuditCommandsUseCase({ gateway = commandAuditGateway } = {}) {
  return {
    execute() {
      return gateway.audit();
    }
  };
}

module.exports = { createAuditCommandsUseCase };
