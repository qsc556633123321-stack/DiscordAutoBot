const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityConciergeButtonDispatchCandidate.js'), 'utf8');
const resolver = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'CommunityConciergeButtonActionResolver.js'), 'utf8');

assert.equal((legacy.match(/customId\.startsWith\('concierge_'\)/g) || []).length, 1);
assert.equal((legacy.match(/await handleConciergeButton\(interaction\)/g) || []).length, 1);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
assert.equal(candidate.includes("require('discord.js')"), false);
assert.equal(candidate.includes("require('../../src") || candidate.includes("require('../../../src"), false);
for (const closedFlow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) {
  assert.equal(runtime.includes(`async function ${closedFlow}`), true);
}
assert.match(runtime, /resolveCommunityConciergeButtonAction\(interaction\.customId\)/);
assert.match(resolver, /concierge_games/);
console.log('Community button-dispatch preparation preserves legacy prefix ownership while Application owns exact Concierge ID mapping.');
