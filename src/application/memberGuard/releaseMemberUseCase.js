function createReleaseMemberUseCase({ repository } = {}) {
  if (!repository?.getSettings) throw new Error('MemberGuard repository with getSettings is required.');

  return {
    execute({ guildId, memberId, guestRoleId = null, memberRoleId = null, actorFacts = {} }) {
      if (!guildId) throw new Error('guildId is required.');
      if (!memberId) return { allowed: false, resultCode: 'MEMBER_ID_REQUIRED', removeRoleIds: [], addRoleIds: [] };
      const settings = repository.getSettings(guildId);
      if (!guestRoleId && !memberRoleId) {
        return { allowed: false, resultCode: 'RELEASE_ROLES_NOT_CONFIGURED', removeRoleIds: [], addRoleIds: [], settings };
      }
      return {
        allowed: true,
        resultCode: 'RELEASE_ALLOWED',
        settings,
        actorFacts: { memberId: actorFacts.memberId || null },
        removeRoleIds: guestRoleId ? [guestRoleId] : [],
        addRoleIds: memberRoleId ? [memberRoleId] : []
      };
    }
  };
}

module.exports = { createReleaseMemberUseCase };
