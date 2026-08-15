const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const factoryPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingJsonReaderFactory.js');
const factory = fs.readFileSync(factoryPath, 'utf8');

assert.equal(fs.existsSync(factoryPath), true);
assert.equal(factory.includes("require('node:path')"), true);
assert.equal(factory.includes('createCommunityOnboardingJsonReader'), true);
for (const removed of ["require('node:fs')", "require('node:path')", 'ensureFile(', 'readJson(', 'DATA_DIR', 'ONBOARDING_FILE', 'createCommunityOnboardingJsonReader(']) {
  assert.equal(runtime.includes(removed), false, `runtime must not retain ${removed}`);
}
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{/g) || []).length, 0);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src/infrastructure/community/CommunityOnboardingJsonReader.js', 'src/infrastructure/community/CommunityOnboardingStateReader.js', 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js', 'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js'], { cwd: root, encoding: 'utf8' }).trim(), '');
console.log('Runtime JsonReader construction uses the Infrastructure default factory with no remaining filesystem path ownership.');
