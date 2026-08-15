const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'communityPublicationStateFilesystemAdapter.js'), 'utf8');
const reader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeDefaultCommunityPublicationPersistenceFeature.js'), 'utf8');

for (const removed of ["require('node:fs')", 'function ensureFile(', 'function readJson(']) assert.equal(runtime.includes(removed), false);
for (const removed of ["require('node:path')", 'DATA_DIR', 'ONBOARDING_FILE']) assert.equal(runtime.includes(removed), false);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 0);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR \}\)/g) || []).length, 0);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2);
assert.match(adapter, /DEFAULT_DATA_DIRECTORY = path\.join\(__dirname, '\.\.', '\.\.', 'data'\)/);
assert.match(adapter, /DEFAULT_ONBOARDING_FILE = path\.join\(DEFAULT_DATA_DIRECTORY, 'onboarding-flows\.json'\)/);
assert.equal(reader.includes('filePath'), false);
assert.equal(candidate.includes('src/systems'), false);
assert.equal(candidate.includes('CommunityOnboardingStateReader'), false);
assert.equal(candidate.includes('discord.js'), false);
const welcome = runtime.slice(runtime.indexOf('async function sendConciergeWelcome'));
assert.equal(welcome.includes('createCommunityPublicationStateFeature'), false);
console.log('Publication persistence path preparation preserves adapter defaults after JsonReader path ownership moves to Infrastructure.');
