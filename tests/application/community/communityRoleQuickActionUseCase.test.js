const assert = require('node:assert/strict');
const { COMMUNITY_ROLE_ACTIONS, createCommunityRoleQuickActionUseCase } = require('../../../src/application/community/communityRoleQuickActionUseCase');

void (async () => {
const calls = [];
const useCase = createCommunityRoleQuickActionUseCase({
  roleMutationGateway: { async addRole(input) { calls.push(input); return true; } }
});

for (const [action, expected] of Object.entries(COMMUNITY_ROLE_ACTIONS)) {
  const result = await useCase.execute({ guildId: 'guild-1', memberId: 'member-1', action });
  assert.deepEqual(result, { added: true, action, roleName: expected.roleName });
  assert.equal(Object.isFrozen(result), true);
}
assert.deepEqual(calls, [
  { guildId: 'guild-1', memberId: 'member-1', roleName: '🎮 遊戲玩家', reason: 'Community concierge quick role' },
  { guildId: 'guild-1', memberId: 'member-1', roleName: '📈 股票投資', reason: 'Community concierge quick role' },
  { guildId: 'guild-1', memberId: 'member-1', roleName: '🛠 開發/AI', reason: 'Community concierge quick role' }
]);
assert.deepEqual(await useCase.execute({ guildId: 'guild-1', memberId: 'member-1', action: 'unknown' }), { added: false, action: 'unknown', roleName: null });
assert.throws(() => createCommunityRoleQuickActionUseCase(), /roleMutationGateway/);
console.log('Community role quick-action use case maps only semantic actions to the frozen role intents.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
