const { createEvaluateMemberGuardUseCase } = require('../application/memberGuard/evaluateMemberGuardUseCase');
const { createGetMemberGuardStatusUseCase } = require('../application/memberGuard/getMemberGuardStatusUseCase');
const { createReleaseMemberUseCase } = require('../application/memberGuard/releaseMemberUseCase');
const { createUpdateMemberGuardSettingsUseCase } = require('../application/memberGuard/updateMemberGuardSettingsUseCase');
const { createMemberGuardRuntimeAdapter } = require('../adapters/memberGuard/memberGuardRuntimeAdapter');
const { createMemberGuardPermissionGateway } = require('../infrastructure/discord/memberGuardPermissionGateway');
const { createMemberRoleGateway } = require('../infrastructure/discord/memberRoleGateway');
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
    updateSettings: createUpdateMemberGuardSettingsUseCase({ repository: memberGuardRepository }),
    releaseMember: createReleaseMemberUseCase({ repository: memberGuardRepository }),
    createMutationGateways({ resolveGuild, logger: gatewayLogger } = {}) {
      return {
        permissionGateway: createMemberGuardPermissionGateway({ resolveGuild, logger: gatewayLogger || logger }),
        memberRoleGateway: createMemberRoleGateway({ resolveGuild, logger: gatewayLogger || logger })
      };
    },
    runtime
  };
}

module.exports = { createMemberGuardFeature };
