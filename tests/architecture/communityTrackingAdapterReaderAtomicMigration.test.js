const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const messageAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
const channelAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
for (const source of [messageAdapter, channelAdapter]) {
  assert.equal(source.includes('readOnboardingData'), false, 'no dual dependency remains');
  assert.equal((source.match(/onboardingStateReader\.readOnboardingState\(\)/g) || []).length, 1);
}
assert.equal(channelAdapter.includes('fromLegacyPublicationRecord'), false);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(/g) || []).length, 3, 'Guide, Roadmap, and Welcome construct one reader each');
assert.equal((runtime.match(/\breadOnboardingData\b/g) || []).length, 0, 'the zero-consumer helper is removed');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityTrackingAdapterReaderFeature.js')), false);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src/infrastructure/community/CommunityOnboardingStateReader.js'], { cwd: root, encoding: 'utf8' }).trim(), '');
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim()).filter((file) => file.startsWith('src/'));
const allowed = [
  'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityWelcomeChannelResolver.js',
  'src/infrastructure/community/CommunityWelcomeDmDeliveryAdapter.js',
  'src/infrastructure/community/CommunityOnboardingJsonReader.js',
  'src/systems/communityConcierge.js'
];
assert.equal(changedProduction.every((file) => allowed.includes(file)), true);
console.log('Atomic tracking adapter migration is reader-backed, per-invocation, dual-free, and composition-free.');
