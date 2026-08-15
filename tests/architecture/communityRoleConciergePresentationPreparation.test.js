const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const candidatePath = path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityRoleConciergePresentation.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const candidate = fs.readFileSync(candidatePath, 'utf8');
const builderPath = path.join(root, 'src', 'modules', 'community', 'CommunityRoleConciergePresentation.js');
assert.equal(fs.existsSync(builderPath), true);
for (const action of ['games', 'invest', 'dev']) {
  assert.match(runtime, new RegExp(`action === '${action}'`));
  assert.match(candidate, new RegExp(`action === '${action}'`));
}
assert.match(runtime, /createCommunityRoleQuickActionFeature/);
assert.match(runtime, /function quickLinks\(guild, kind\)/);
assert.match(runtime, /buildCommunityRoleConciergePresentationPayload/);
assert.match(runtime, /await interaction\.reply\(payload\)/);
assert.doesNotMatch(runtime, /member\.roles\.add/);
for (const forbidden of ['interaction.reply', 'createCommunityRoleQuickActionFeature', 'resolveCommunityConciergeButtonAction', 'member.roles.add', 'node:fs']) {
  assert.doesNotMatch(candidate, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}
assert.match(candidate, /require\(['"]discord\.js['"]\)/);
assert.doesNotMatch(candidate, /catch\s*\(/);
assert.match(candidate, /return null/);
console.log('Role Concierge presentation preparation remains valid after the approved Module payload redirect.');
