const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const stateReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const jsonReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingJsonReader.js'), 'utf8');
const messageAdapter = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
const channelAdapter = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'community', 'community-state-reader-json-dependency-cases.json'), 'utf8'));
assert.equal(stateReader.includes('filePath'), false); assert.equal(stateReader.includes('readJson'), false); assert.equal(stateReader.includes('onboardingJsonReader.readRoot({})'), true);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ filePath: ONBOARDING_FILE, readJson \}\)/g) || []).length, 0);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(\{ dataDirectory: DATA_DIR, filePath: ONBOARDING_FILE \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal(jsonReader.includes('readRoot('), true);
for (const adapter of [messageAdapter, channelAdapter]) {
  assert.equal(adapter.includes('readOnboardingData'), false);
  assert.equal(adapter.includes('onboardingStateReader'), true);
}
for (const retainedPath of ['DATA_DIR', 'ONBOARDING_FILE']) assert.equal(runtime.includes(retainedPath), true, `Runtime path ownership must retain ${retainedPath}`);
for (const removed of ["require('node:fs')", 'function ensureFile(', 'function readJson(', 'fs.']) assert.equal(runtime.includes(removed), false, `Dead filesystem cleanup must remove ${removed}`);
assert.ok(fixture.length >= 40);
for (const marker of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(marker), true);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src/infrastructure/community/CommunityOnboardingStateReader.js'], { cwd: root, encoding: 'utf8' }).trim(), '');
console.log('StateReader JSON dependency migration preserves the approved atomic two-file source boundary.');
