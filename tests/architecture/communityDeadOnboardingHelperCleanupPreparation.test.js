const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const reader = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityOnboardingStateReader.js'), 'utf8');
const messageAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
const channelAdapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'), 'utf8');
const fixtures = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-dead-onboarding-helper-cleanup-cases.json'), 'utf8'));
assert.ok(fixtures.length >= 40);
for (const source of [reader, messageAdapter, channelAdapter]) {
  assert.equal(source.includes('readOnboardingData'), false);
  assert.equal(source.includes('saveOnboarding'), false);
}
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(/g) || []).length, 3);
assert.equal((runtime.match(/function readJson\(/g) || []).length, 1);
assert.equal((runtime.match(/function ensureFile\(/g) || []).length, 1);
assert.equal(runtime.includes('readOnboardingData'), false);
assert.equal(runtime.includes('saveOnboarding'), false);
const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim());
const changedSource = changed.filter((file) => file.startsWith('src/'));
assert.equal(
  changedSource.length === 0 || (changedSource.length === 1 && changedSource[0] === 'src/systems/communityConcierge.js'),
  true,
  'Preparation and audit runs must be production-clean; implementation may only touch the approved runtime file.'
);
console.log('Both private helpers are removed while runtime reader filesystem dependencies remain active.');
