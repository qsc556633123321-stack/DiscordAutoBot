function createUpdateMemberGuardSettingsUseCase({ repository } = {}) {
  if (!repository?.getSettings || !repository?.updateSettings) {
    throw new Error('MemberGuard repository with getSettings and updateSettings is required.');
  }

  return {
    execute({ guildId, patch = {}, guestRoleId = null, actorFacts = {} }) {
      if (!guildId) throw new Error('guildId is required.');
      const hasPatch = Object.keys(patch).length > 0;
      const settings = hasPatch ? repository.updateSettings(guildId, patch) : repository.getSettings(guildId);
      return {
        settings,
        resultCode: hasPatch ? 'SETTINGS_UPDATED' : 'SETTINGS_READ',
        actorFacts: { memberId: actorFacts.memberId || null },
        permissionPlan: settings.guestLockdown
          ? { action: 'APPLY_GUEST_LOCKDOWN', guildId, guestRoleId }
          : null
      };
    }
  };
}

module.exports = { createUpdateMemberGuardSettingsUseCase };
