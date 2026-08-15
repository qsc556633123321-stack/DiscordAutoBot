const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const reader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingJsonReader.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeDefaultCommunityOnboardingJsonReaderFactoryV2.js'), 'utf8');

for (const retained of ["require('node:path')", "const DATA_DIR = path.join(__dirname, '..', 'data');", "const ONBOARDING_FILE = path.join(DATA_DIR, 'onboarding-flows.json');"]) assert.equal(runtime.includes(retained), true);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR \}\)/g) || []).length, 0);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(\{ dataDirectory: DATA_DIR, filePath: ONBOARDING_FILE \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal(reader.includes('DEFAULT_DATA_DIRECTORY'), false);
assert.equal(candidate.includes('src/systems'), false);
assert.equal(candidate.includes('discord.js'), false);
assert.equal(candidate.includes('createCommunityPublicationStateFeature'), false);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim(), '');

console.log('JsonReader default-path preparation freezes the remaining runtime path ownership without production changes.');
