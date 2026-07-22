const { createGetMemberGuardStatusUseCase: createUseCase } = require('../memberGuard/getMemberGuardStatusUseCase');

function createGetMemberGuardStatusUseCase({ service, repository, metricsReader } = {}) {
  if (service) {
    return {
      execute({ guildId }) {
        const settings = service.getMemberGuardSettings(guildId);
        return { enabled: settings.enabled, safeMode: settings.safeMode, newAccountDays: settings.newAccountDays, recentJoinCount: service.getRecentJoinCount(guildId), recentBlockedCount: service.getRecentBlockedCount(guildId) };
      }
    };
  }
  return createUseCase({ repository, metricsReader });
}

module.exports = { createGetMemberGuardStatusUseCase };
