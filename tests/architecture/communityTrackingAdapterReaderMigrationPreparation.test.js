const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const messageAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
const channelAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-tracking-adapter-reader-migration-cases.json'), 'utf8'));
assert.ok(fixtures.length >= 50, 'Preparation fixture must retain the required migration cases');
for (const source of [messageAdapter, channelAdapter]) {
  assert.equal(source.includes('onboardingStateReader'), true, 'Production adapters are reader-backed');
  assert.equal(source.includes('readOnboardingData'), false);
  assert.equal(source.includes('writeFile'), false);
  assert.equal(source.includes('discord.js'), false);
}
assert.equal(channelAdapter.includes('fromLegacyPublicationRecord'), false, 'Channel tracking remains raw-field-only');
assert.equal((runtime.match(/readOnboardingData/g) || []).length, 1, 'only the retained helper definition remains');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityTrackingAdapterReaderFeature.js')), false);
const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim());
const allowedProduction = [
  'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js',
  'src/systems/communityConcierge.js'
];
assert.equal(changed.filter((file) => file.startsWith('src/')).every((file) => allowedProduction.includes(file)), true, 'Only the approved atomic migration sources may change');
console.log('Tracking adapter reader migration implementation preserves reader-backed dependency ownership.');
