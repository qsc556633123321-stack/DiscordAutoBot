const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const candidatePath = path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityNonRoleConciergePresentationCandidate.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const candidate = fs.readFileSync(candidatePath, 'utf8');
assert.equal(fs.existsSync(runtimePath), true);
assert.equal(fs.existsSync(candidatePath), true);
for (const action of ['night', 'bot', 'roadmap']) {
  assert.match(runtime, new RegExp(`action === '${action}'`));
  assert.match(candidate, new RegExp(`action === '${action}'`));
}
assert.match(runtime, /await interaction\.reply\(/);
assert.doesNotMatch(candidate, /interaction\.reply/);
assert.doesNotMatch(candidate, /handleConciergeButton/);
assert.doesNotMatch(candidate, /resolveCommunityConciergeButtonAction/);
assert.doesNotMatch(candidate, /createCommunityRoleQuickActionFeature/);
assert.match(candidate, /require\(['"]discord\.js['"]\)/);
assert.doesNotMatch(candidate, /require\(['"]node:fs['"]\)/);
assert.match(candidate, /buildRoadmapEmbed/);
assert.match(runtime, /function quickLinks\(guild, kind\)/);
assert.match(runtime, /function buildRoadmapEmbed\(\)/);
assert.doesNotMatch(candidate, /catch \(/);
assert.match(runtime, /buildCommunityNonRoleConciergePresentationPayload/);
console.log('Non-role Concierge presentation preparation now freezes the approved Module payload ownership and runtime reply boundaries.');
