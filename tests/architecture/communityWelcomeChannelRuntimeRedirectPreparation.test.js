const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityWelcomeChannelTrackingRuntimeRedirect.js'), 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);

assert.equal(welcome.includes('readOnboardingData()'), false);
assert.equal(welcome.includes('data.guideChannelId'), false);
assert.equal(welcome.includes('fromLegacyPublicationRecord'), false);
assert.equal(welcome.includes('readTrackedChannel'), true);
assert.equal(welcome.includes('createCommunityPublicationChannelTrackingReadRequest'), true);
assert.equal(welcome.includes('createCommunityPublicationChannelTrackingReadCompatibilityAdapter'), true);
assert.match(welcome, /publication: 'guide'/);
assert.equal(candidate.includes('createCommunityPublicationChannelTrackingReadRequest'), true);
assert.equal(candidate.includes('createCommunityPublicationChannelTrackingReadCompatibilityAdapter'), true);
for (const forbidden of ['data.guideChannelId', 'fromLegacyPublicationRecord', 'saveOnboarding', 'persist', 'writeFile', 'discord.js']) {
  assert.equal(candidate.includes(forbidden), false, `Candidate must not own ${forbidden}`);
}
assert.equal(fs.existsSync(path.join(root, 'src', 'composition', 'communityPublicationChannelTrackingReadFeature.js')), false);
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 1, 'only the compatibility reader definition remains');
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.equal(changedProduction.every((file) => file === 'src/systems/communityConcierge.js'), true);
console.log('Welcome runtime redirect uses the approved channel tracking boundary without raw state leakage.');
