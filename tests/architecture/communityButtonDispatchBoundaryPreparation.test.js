const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityConciergeButtonDispatchCandidate.js'), 'utf8');

assert.equal((legacy.match(/customId\.startsWith\('concierge_'\)/g) || []).length, 1);
assert.equal((legacy.match(/await handleConciergeButton\(interaction\)/g) || []).length, 1);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
assert.equal(candidate.includes("require('discord.js')"), false);
assert.equal(candidate.includes("require('../../src") || candidate.includes("require('../../../src"), false);
for (const closedFlow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) {
  assert.equal(runtime.includes(`async function ${closedFlow}`), true);
}
const productionDiff = [
  execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }),
  execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' })
].join('\n').trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(productionDiff, []);
console.log('Community button-dispatch preparation freezes legacy prefix ownership with no production source diff.');
