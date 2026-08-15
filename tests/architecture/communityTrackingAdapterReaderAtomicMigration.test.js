const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const messageAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
const channelAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'), 'utf8');
const stateReader = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityOnboardingStateReader.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
for (const source of [messageAdapter, channelAdapter]) {
  assert.equal(source.includes('readOnboardingData'), false, 'no dual dependency remains');
  assert.equal((source.match(/onboardingStateReader\.readOnboardingState\(\)/g) || []).length, 1);
}
assert.equal(channelAdapter.includes('fromLegacyPublicationRecord'), false);
assert.equal(stateReader.includes('onboardingJsonReader.readRoot({})'), true);
for (const legacyContract of ['filePath', 'readJson']) {
  assert.equal(stateReader.includes(legacyContract), false, `StateReader must not retain ${legacyContract}`);
}
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(\{ dataDirectory: DATA_DIR, filePath: ONBOARDING_FILE \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(/g) || []).length, 3, 'Guide, Roadmap, and Welcome construct one reader each');
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ filePath: ONBOARDING_FILE, readJson \}\)/g) || []).length, 0);
assert.equal((runtime.match(/\breadOnboardingData\b/g) || []).length, 0, 'the zero-consumer helper is removed');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityTrackingAdapterReaderFeature.js')), false);
const changedProduction = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changedProduction, [], 'The committed tracking adapter migration must remain valid from a clean production source tree.');
console.log('Atomic tracking adapter migration is reader-backed, per-invocation, dual-free, and composition-free.');
