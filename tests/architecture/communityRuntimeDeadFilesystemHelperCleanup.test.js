const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');

for (const removed of ["require('node:fs')", 'function ensureFile(', 'function readJson(', 'fs.', 'existsSync', 'mkdirSync', 'writeFileSync', 'readFileSync']) assert.equal(runtime.includes(removed), false, `Runtime must not retain ${removed}`);
for (const removed of ["require('node:path')", 'DATA_DIR', 'ONBOARDING_FILE']) assert.equal(runtime.includes(removed), false, `Runtime must remove ${removed}`);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 0);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
for (const flow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(flow), true);
for (const file of ['CommunityOnboardingJsonReader.js', 'CommunityOnboardingStateReader.js', 'CommunityPublicationTrackingReadCompatibilityAdapter.js', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js']) {
  assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', `src/infrastructure/community/${file}`], { cwd: root, encoding: 'utf8' }).trim(), '');
}
console.log('Dead community filesystem helpers are removed while runtime path ownership and closed flows remain intact.');
