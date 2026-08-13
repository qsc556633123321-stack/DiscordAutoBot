const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityWelcomeDmDeliveryAdapterV2.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.ok(start >= 0 && end > start);
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), true);
assert.equal(welcome.includes('createCommunityWelcomeDmDeliveryAdapter'), false);
assert.equal(welcome.includes('readTrackedChannel'), true);
assert.equal(welcome.includes('createCommunityWelcomeChannelResolver'), true);
for (const forbidden of ['readTrackedChannel', 'CommunityWelcomeChannelResolver', 'CommunityOnboardingStateReader', 'buildCommunityWelcomeMessage', 'mapLegacyWelcomeDeliveryRequest', 'node:fs', 'node:path', 'ONBOARDING_FILE', 'readJson', 'console.', 'logger']) {
  assert.equal(candidate.includes(forbidden), false, `DM candidate must not own ${forbidden}`);
}
assert.equal(candidate.includes('member.send(payload).catch(() => null)'), true);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim(), '');
console.log('Welcome DM delivery preparation keeps runtime direct, isolates the candidate, and preserves tracking, resolver, payload, and filesystem ownership.');
