const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityWelcomeDmRuntimeRedirect.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.ok(start >= 0 && end > start);
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), true);
assert.equal(welcome.includes('createCommunityWelcomeDmDeliveryAdapter'), false);
assert.equal(welcome.includes('readTrackedChannel'), true);
assert.equal(welcome.includes('createCommunityWelcomeChannelResolver'), true);
assert.equal(welcome.indexOf('if (!guideChannel) return') < welcome.indexOf('mapLegacyWelcomeDeliveryRequest'), true);
for (const forbidden of [
  'CommunityPublicationChannelTracking', 'CommunityWelcomeChannelResolver',
  'CommunityOnboardingStateReader', 'node:fs', 'node:path', 'readJson',
  'buildCommunityWelcomeMessage', 'mapLegacyWelcomeDeliveryRequest', 'console.', 'logger'
]) {
  assert.equal(candidate.includes(forbidden), false, `Candidate must not own ${forbidden}`);
}
assert.equal(candidate.includes('createCommunityWelcomeDmDeliveryAdapter'), true);
assert.equal(candidate.includes('await dmDelivery.send(payload)'), true);
assert.deepEqual(
  execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim(),
  ''
);
console.log('Welcome DM runtime redirect preparation preserves direct runtime ownership and isolates the test-only candidate.');
