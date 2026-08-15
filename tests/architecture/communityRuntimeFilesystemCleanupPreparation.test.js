const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const stateReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
for (const identifier of ['DATA_DIR', 'ONBOARDING_FILE', "require('node:path')"]) {
  assert.equal(runtime.includes(identifier), false, `Runtime path ownership must remove ${identifier}`);
}
for (const removed of ["require('node:fs')", 'function ensureFile(', 'function readJson(', 'fs.']) assert.equal(runtime.includes(removed), false, `Dead filesystem cleanup must remove ${removed}`);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 0);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal(stateReader.includes('onboardingJsonReader.readRoot({})'), true);
for (const flow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(flow), true);
for (const file of ['CommunityOnboardingJsonReader.js', 'CommunityOnboardingStateReader.js', 'CommunityPublicationTrackingReadCompatibilityAdapter.js', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js']) {
  assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', `src/infrastructure/community/${file}`], { cwd: root, encoding: 'utf8' }).trim(), '');
}
console.log('Runtime filesystem cleanup preparation freezes current helper/path ownership and closed-flow construction truth.');
