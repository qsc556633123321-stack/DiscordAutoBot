const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'community', 'community-welcome-final-closure-cases.json'), 'utf8'));
const welcomeStart = runtime.indexOf('async function sendConciergeWelcome');
const exportsStart = runtime.indexOf('module.exports');
const welcome = runtime.slice(welcomeStart, exportsStart);

assert.ok(fixtures.length >= 60);
for (const required of ['createCommunityOnboardingStateReader', 'readTrackedChannel', 'channels.cache.get', 'channels.fetch', 'findChannelByName', 'mapLegacyWelcomeDeliveryRequest', 'buildCommunityWelcomeMessage', 'member.send(payload).catch(() => null)']) {
  assert.equal(welcome.includes(required), true, `Welcome flow must retain ${required}`);
}
for (const forbidden of ['readOnboardingData', 'saveOnboarding', 'data.guideChannelId', 'fromLegacyPublicationRecord']) {
  assert.equal(welcome.includes(forbidden), false, `Welcome flow must not regain ${forbidden}`);
}
assert.equal(runtime.includes('function maybeAddRole'), true);
assert.equal(runtime.includes('async function handleConciergeButton'), true);
assert.equal(runtime.includes('async function generateConciergeText'), true);
const changedSource = execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changedSource, [], 'Preparation must not change production source');
console.log('Welcome final closure preparation freezes current resolution, DM delivery, and isolation boundaries.');
