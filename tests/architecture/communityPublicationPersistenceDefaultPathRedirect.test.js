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
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(\{ dataDirectory: DATA_DIR, filePath: ONBOARDING_FILE \}\)/g) || []).length, 3);
for (const retained of ["require('node:path')", "const DATA_DIR = path.join(__dirname, '..', 'data');", "const ONBOARDING_FILE = path.join(DATA_DIR, 'onboarding-flows.json');"]) assert.equal(runtime.includes(retained), true);
assert.equal(DEFAULT_DATA_DIRECTORY, path.join(root, 'src', 'data'));
assert.equal(DEFAULT_ONBOARDING_FILE, path.join(root, 'src', 'data', 'onboarding-flows.json'));
const welcome = runtime.slice(runtime.indexOf('async function sendConciergeWelcome'));
assert.equal(welcome.includes('createCommunityPublicationStateFeature'), false);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', adapterPath], { cwd: root, encoding: 'utf8' }).trim(), '');
const productionDiff = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(productionDiff, ['src/systems/communityConcierge.js']);

console.log('Publication persistence runtime uses adapter defaults while JsonReader paths remain runtime-owned.');
