const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const adapter = fs.readFileSync(path.join(root, 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guideCandidate = fs.readFileSync(path.join(root, 'tests/fakes/community/FakeCommunityGuideTrackingReadRuntimeRedirect.js'), 'utf8');
const roadmapCandidate = fs.readFileSync(path.join(root, 'tests/fakes/community/FakeCommunityRoadmapTrackingReadRuntimeRedirect.js'), 'utf8');

for (const forbidden of ['discord.js', 'cache', 'lastResult', 'lastGuild', 'writeFile', 'saveOnboarding', '.persist(', 'updatedAt']) {
  assert.equal(adapter.includes(forbidden), false, `Adapter must remain stateless and read-only: ${forbidden}`);
}
for (const source of [guideCandidate, roadmapCandidate]) {
  for (const forbidden of ['fromLegacyPublicationRecord', 'guideMessageId', 'roadmapMessageId', 'data.']) {
    assert.equal(source.includes(forbidden), false, `Runtime candidate must not leak raw tracking state: ${forbidden}`);
  }
  assert.equal(source.includes('createCommunityPublicationTrackingReadRequest'), true);
  assert.equal(source.includes('createCommunityPublicationTrackingReadCompatibilityAdapter'), true);
}
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationTrackingReadFeature.js')), false);
const welcome = runtime.match(/async function sendConciergeWelcome\(member\) \{([\s\S]*?)\n\}\n\nmodule\.exports/)[1];
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 2, 'definition plus Welcome must remain');
assert.equal(welcome.includes('readOnboardingData()'), true);
assert.equal(welcome.includes('guideChannelId'), true);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1, 'saveOnboarding remains retained with zero runtime consumers');
const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim());
assert.equal(
  changed.filter((file) => file.startsWith('src/')).every((file) => [
    'src/systems/communityConcierge.js',
    'src/application/community/ports/CommunityPublicationChannelTrackingReadPort.js',
    'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'
  ].includes(file)),
  true,
  'Only the approved runtime source may change'
);

console.log('Tracking-read redirect guards keep adapters stateless, Welcome isolated, and runtime source scoped.');
