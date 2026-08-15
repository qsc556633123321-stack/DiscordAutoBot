const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ROLE_ACTIONS, resolveCommunityRoleQuickAction } = require('../../fakes/community/FakeCommunityRoleQuickActionCandidate');

const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
for (const [customId, expected] of Object.entries(ROLE_ACTIONS)) {
  assert.deepEqual(resolveCommunityRoleQuickAction(customId), expected);
  assert.equal(runtime.includes(`'${expected.roleName}'`), true);
}
assert.equal(runtime.includes("maybeAddRole(interaction.member, '🎮 遊戲玩家')"), true);
assert.equal(runtime.includes('maybeAddRole(interaction.member, roleName)'), true);
for (const customId of ['concierge_night', 'concierge_bot', 'concierge_roadmap', 'unknown']) {
  assert.equal(resolveCommunityRoleQuickAction(customId), null);
}
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 1);
assert.equal((runtime.match(/member\.roles\.remove\(/g) || []).length, 0);
console.log('Community role quick-action candidate exactly characterizes the current add-only Concierge role intents.');
