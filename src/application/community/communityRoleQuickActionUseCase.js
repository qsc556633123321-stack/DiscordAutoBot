const { assertCommunityRoleMutationGateway } = require('./ports/CommunityRoleMutationGateway');

const COMMUNITY_ROLE_ACTIONS = Object.freeze({
  games: Object.freeze({ roleName: '🎮 遊戲玩家' }),
  invest: Object.freeze({ roleName: '📈 股票投資' }),
  dev: Object.freeze({ roleName: '🛠 開發/AI' })
});

function createCommunityRoleQuickActionUseCase({ roleMutationGateway } = {}) {
  assertCommunityRoleMutationGateway(roleMutationGateway);

  return Object.freeze({
    async execute({ guildId, memberId, action } = {}) {
      const roleAction = COMMUNITY_ROLE_ACTIONS[action];
      if (!roleAction) return Object.freeze({ added: false, action, roleName: null });
      const added = await roleMutationGateway.addRole({
        guildId,
        memberId,
        roleName: roleAction.roleName,
        reason: 'Community concierge quick role'
      });
      return Object.freeze({ added, action, roleName: roleAction.roleName });
    }
  });
}

module.exports = { COMMUNITY_ROLE_ACTIONS, createCommunityRoleQuickActionUseCase };
