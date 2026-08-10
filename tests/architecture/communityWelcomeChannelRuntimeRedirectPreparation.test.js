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

assert.equal(welcome.includes('readOnboardingData()'), true);
assert.equal(welcome.includes('data.guideChannelId'), true);
assert.equal(welcome.includes('readTrackedChannel'), false);
assert.equal(welcome.includes('CommunityPublicationChannelTrackingRead'), false);
assert.equal(candidate.includes('createCommunityPublicationChannelTrackingReadRequest'), true);
assert.equal(candidate.includes('createCommunityPublicationChannelTrackingReadCompatibilityAdapter'), true);
for (const forbidden of ['data.guideChannelId', 'fromLegacyPublicationRecord', 'saveOnboarding', 'persist', 'writeFile', 'discord.js']) {
  assert.equal(candidate.includes(forbidden), false, `Candidate must not own ${forbidden}`);
}
assert.equal(fs.existsSync(path.join(root, 'src', 'composition', 'communityPublicationChannelTrackingReadFeature.js')), false);
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 2, 'definition plus Welcome remain');
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.deepEqual(changedProduction, [], 'Runtime redirect preparation must not change production source');
console.log('Welcome runtime redirect preparation preserves legacy runtime and validates the production-boundary candidate.');
