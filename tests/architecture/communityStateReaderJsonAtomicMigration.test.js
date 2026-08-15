const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const stateReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
for (const forbidden of ['filePath', 'readJson', 'if (onboardingJsonReader)', 'catch', 'console.']) assert.equal(stateReader.includes(forbidden), false, `StateReader must not retain ${forbidden}`);
assert.equal(stateReader.includes('onboardingJsonReader.readRoot({})'), true);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(\{ dataDirectory: DATA_DIR, filePath: ONBOARDING_FILE \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ filePath: ONBOARDING_FILE, readJson \}\)/g) || []).length, 0);
for (const file of ['CommunityOnboardingJsonReader.js', 'CommunityPublicationTrackingReadCompatibilityAdapter.js', 'CommunityPublicationChannelTrackingReadCompatibilityAdapter.js']) {
  assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', `src/infrastructure/community/${file}`], { cwd: root, encoding: 'utf8' }).trim(), '');
}
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changed, [], 'The committed migration must remain valid from a clean production source tree.');
console.log('StateReader JSON dependency migration is atomic, dual-free, and isolates unchanged boundaries.');
