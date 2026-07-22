const memberGuardService = require('../../services/security/memberGuardService');

function createGetMemberGuardStatusUseCase({ service = memberGuardService } = {}) {
  return {
    execute({ guildId }) {
      const settings = service.getMemberGuardSettings(guildId);
      return {
        enabled: settings.enabled,
        safeMode: settings.safeMode,
        newAccountDays: settings.newAccountDays,
        recentJoinCount: service.getRecentJoinCount(guildId),
        recentBlockedCount: service.getRecentBlockedCount(guildId)
      };
    }
  };
}

module.exports = { createGetMemberGuardStatusUseCase };
