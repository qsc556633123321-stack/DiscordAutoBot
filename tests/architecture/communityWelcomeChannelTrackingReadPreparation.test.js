const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const start = runtime.indexOf('async function sendConciergeWelcome');
const end = runtime.indexOf('\n}\n\nmodule.exports', start);
const welcome = runtime.slice(start, end);
const fakePort = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityPublicationChannelTrackingReadPort.js'), 'utf8');
const fakeAdapter = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityPublicationChannelTrackingReadCompatibilityAdapter.js'), 'utf8');

assert.ok(start >= 0 && end > start, 'Welcome runtime boundaries must exist');
assert.equal((welcome.match(/readOnboardingData\(\)/g) || []).length, 1);
assert.equal(welcome.includes('data.guideChannelId'), true);
assert.equal(welcome.includes('fromLegacyPublicationRecord'), false);
assert.equal(welcome.includes('readTrackedMessage'), false);
assert.equal(welcome.includes('saveOnboarding'), false);
assert.equal(welcome.includes('persist'), false);
assert.equal(fakePort.includes('discord.js'), false);
assert.equal(fakeAdapter.includes('discord.js'), false);
for (const forbidden of ['writeFile', 'saveOnboarding', 'persist', 'updatedAt', 'fromLegacyPublicationRecord']) {
  assert.equal(fakeAdapter.includes(forbidden), false, `Candidate adapter must not own ${forbidden}`);
}
assert.equal((fakeAdapter.match(/readOnboardingData\(\)/g) || []).length, 1);
assert.equal(fakeAdapter.includes('guideMessageId'), false);
assert.equal(fakeAdapter.includes('roadmapMessageId'), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'ports', 'CommunityPublicationChannelTrackingReadPort.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js')), true);
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.deepEqual(changedProduction, [], 'Later preparation slices must not modify committed production boundaries');
console.log('Welcome channel tracking read preparation keeps runtime legacy-owned while the approved boundary is implemented.');
