const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityConciergeButtonActionResolver.js'), 'utf8');
assert.equal((legacy.match(/customId\.startsWith\('concierge_'\)/g) || []).length, 1);
assert.match(legacy, /console\.error\('Concierge button failed:', error\)/);
assert.match(legacy, /!interaction\.replied && !interaction\.deferred/);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
assert.match(runtime, /id === 'concierge_games'/);
assert.match(runtime, /id === 'concierge_invest' \|\| id === 'concierge_dev'/);
assert.match(runtime, /return false;/);
for (const name of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) {
  assert.equal(runtime.includes(`async function ${name}`), true);
}
for (const forbidden of ['discord.js', 'interaction', 'EmbedBuilder', 'CommunityRoleQuickAction']) {
  assert.equal(candidate.includes(forbidden), false);
}
const productionDiff = [
  execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }),
  execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' })
].join('\n').trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(productionDiff, []);
console.log('Concierge button resolver preparation preserves legacy dispatch, runtime presentation, and zero production source diff.');
