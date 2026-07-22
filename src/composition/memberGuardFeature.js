const { createEvaluateMemberGuardUseCase } = require('../application/memberGuard/evaluateMemberGuardUseCase');
const { createGetMemberGuardStatusUseCase } = require('../application/memberGuard/getMemberGuardStatusUseCase');
const { createMemberGuardRuntimeAdapter } = require('../adapters/memberGuard/memberGuardRuntimeAdapter');
const { writeServerLog } = require('../infrastructure/discord/serverLogGateway');
const { createJsonMemberGuardRepository } = require('../infrastructure/storage/jsonMemberGuardRepository');
const { enableLinkGuardForSafeMode } = require('../services/security/securityDecisionService');

function createMemberGuardFeature({ repository, logger, clock, runtimeAdapterFactory = createMemberGuardRuntimeAdapter } = {}) {
  const memberGuardRepository = repository || createJsonMemberGuardRepository();
  const runtime = runtimeAdapterFactory({
    repository: memberGuardRepository,
    evaluateMemberGuard: createEvaluateMemberGuardUseCase({ repository: memberGuardRepository, ...(clock ? { clock } : {}) }),
    enableLinkGuardForSafeMode,
    writeServerLog,
    logger
  });
  return {
    repository: memberGuardRepository,
    getStatus: createGetMemberGuardStatusUseCase({ repository: memberGuardRepository, metricsReader: runtime }),
    evaluate: createEvaluateMemberGuardUseCase({ repository: memberGuardRepository, ...(clock ? { clock } : {}) }),
    runtime
  };
}

module.exports = { createMemberGuardFeature };
