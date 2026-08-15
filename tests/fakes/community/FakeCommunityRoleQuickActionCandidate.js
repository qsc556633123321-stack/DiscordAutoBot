const ROLE_ACTIONS = Object.freeze({
  concierge_games: Object.freeze({ key: 'games', roleName: '🎮 遊戲玩家' }),
  concierge_invest: Object.freeze({ key: 'invest', roleName: '📈 股票投資' }),
  concierge_dev: Object.freeze({ key: 'dev', roleName: '🛠 開發/AI' })
});

function resolveCommunityRoleQuickAction(customId) {
  return ROLE_ACTIONS[customId] || null;
}

module.exports = { ROLE_ACTIONS, resolveCommunityRoleQuickAction };
