const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
  DEFAULT_DATA_DIRECTORY,
  DEFAULT_ONBOARDING_FILE
} = require('../../src/infrastructure/community/communityPublicationStateFilesystemAdapter');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const adapterPath = 'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js';

assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR \}\)/g) || []).length, 0);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 0);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
for (const removed of ["require('node:path')", 'DATA_DIR', 'ONBOARDING_FILE']) assert.equal(runtime.includes(removed), false);
assert.equal(DEFAULT_DATA_DIRECTORY, path.join(root, 'src', 'data'));
assert.equal(DEFAULT_ONBOARDING_FILE, path.join(root, 'src', 'data', 'onboarding-flows.json'));
const welcome = runtime.slice(runtime.indexOf('async function sendConciergeWelcome'));
assert.equal(welcome.includes('createCommunityPublicationStateFeature'), false);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', adapterPath], { cwd: root, encoding: 'utf8' }).trim(), '');
console.log('Publication persistence runtime uses adapter defaults while JsonReader paths are Infrastructure-owned.');
