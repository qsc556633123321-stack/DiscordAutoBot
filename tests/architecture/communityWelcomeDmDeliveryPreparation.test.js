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
assert.equal(welcome.includes('member.send(payload).catch(() => null)'), false);
assert.equal(welcome.includes('createCommunityWelcomeDmDeliveryAdapter'), true);
assert.equal(welcome.includes('await dmDelivery.send(payload)'), true);
assert.equal(welcome.includes('readTrackedChannel'), true);
assert.equal(welcome.includes('createCommunityWelcomeChannelResolver'), true);
for (const forbidden of ['readTrackedChannel', 'CommunityWelcomeChannelResolver', 'CommunityOnboardingStateReader', 'buildCommunityWelcomeMessage', 'mapLegacyWelcomeDeliveryRequest', 'node:fs', 'node:path', 'ONBOARDING_FILE', 'readJson', 'console.', 'logger']) {
  assert.equal(candidate.includes(forbidden), false, `DM candidate must not own ${forbidden}`);
}
assert.equal(candidate.includes('member.send(payload).catch(() => null)'), true);
const changedSource = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);
assert.equal(
  changedSource.length === 0
    || (changedSource.length === 1 && changedSource[0] === 'src/systems/communityConcierge.js'),
  true,
  'DM delivery preparation may be clean or modify only communityConcierge.js'
);
console.log('Welcome DM delivery boundary stays isolated while runtime ownership is redirected through it.');
