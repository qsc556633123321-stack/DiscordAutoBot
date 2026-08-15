const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const stateReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
for (const identifier of ['const DATA_DIR = path.join(__dirname, \'..\', \'data\');', 'const ONBOARDING_FILE = path.join(DATA_DIR, \'onboarding-flows.json\');', 'function ensureFile(', 'function readJson(']) {
  assert.equal(runtime.includes(identifier), true, `Pre-cleanup runtime must retain ${identifier}`);
}
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(\{ dataDirectory: DATA_DIR, filePath: ONBOARDING_FILE \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal(stateReader.includes('onboardingJsonReader.readRoot({})'), true);
for (const flow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(flow), true);
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changed, []);
console.log('Runtime filesystem cleanup preparation freezes current helper/path ownership and closed-flow construction truth.');
