const { createCommandAuditReport } = require('../../domain/audit/commandAuditReport');

function createRunCommandAuditUseCase({ gateway, reportFactory = createCommandAuditReport } = {}) {
  if (!gateway?.audit) throw new Error('Command audit gateway is required.');

  return {
    execute() {
      return reportFactory(gateway.audit());
    }
  };
}

module.exports = { createRunCommandAuditUseCase };
