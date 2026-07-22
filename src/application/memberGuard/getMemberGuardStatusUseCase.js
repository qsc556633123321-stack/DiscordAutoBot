function createGetMemberGuardStatusUseCase({ repository, metricsReader = {} } = {}) {
  if (!repository?.getStatus) throw new Error('MemberGuard repository with getStatus is required.');

  return {
    execute({ guildId }) {
      if (!guildId) throw new Error('guildId is required.');
      const status = repository.getStatus(guildId);
      return {
        enabled: Boolean(status.enabled),
        safeMode: Boolean(status.safeMode),
        newAccountDays: Number(status.newAccountDays || 0),
        recentJoinCount: Number(metricsReader.getRecentJoinCount?.(guildId) || 0),
        recentBlockedCount: Number(metricsReader.getRecentBlockedCount?.(guildId) || 0)
      };
    }
  };
}

module.exports = { createGetMemberGuardStatusUseCase };
