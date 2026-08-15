const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROLE_ACTIONS, resolveCommunityRoleQuickAction } = require('../../fakes/community/FakeCommunityRoleQuickActionCandidate');

const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const useCase = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'communityRoleQuickActionUseCase.js'), 'utf8');
for (const [customId, expected] of Object.entries(ROLE_ACTIONS)) {
  assert.deepEqual(resolveCommunityRoleQuickAction(customId), expected);
  assert.equal(useCase.includes(`'${expected.roleName}'`), true);
}
assert.equal(runtime.includes("maybeAddRole(interaction.member, '🎮 遊戲玩家')"), false);
assert.equal(runtime.includes('maybeAddRole(interaction.member, roleName)'), false);
assert.equal(runtime.includes("action: 'games'"), true);
assert.equal(runtime.includes('action: kind'), true);
for (const customId of ['concierge_night', 'concierge_bot', 'concierge_roadmap', 'unknown']) {
  assert.equal(resolveCommunityRoleQuickAction(customId), null);
}
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
assert.equal((runtime.match(/member\.roles\.remove\(/g) || []).length, 0);
console.log('Community role quick-action candidate exactly characterizes the current add-only Concierge role intents.');
