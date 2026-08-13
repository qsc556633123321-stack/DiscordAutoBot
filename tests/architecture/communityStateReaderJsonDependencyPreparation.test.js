const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const stateReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const jsonReader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingJsonReader.js'), 'utf8');
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests', 'fixtures', 'community', 'community-state-reader-json-dependency-cases.json'), 'utf8'));
assert.equal(stateReader.includes('filePath, readJson'), true); assert.equal(stateReader.includes('onboardingJsonReader'), false);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ filePath: ONBOARDING_FILE, readJson \}\)/g) || []).length, 3);
assert.equal(runtime.includes('createCommunityOnboardingJsonReader'), false);
assert.equal(jsonReader.includes('readRoot('), true);
assert.ok(fixture.length >= 40);
for (const marker of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(marker), true);
const changed = execFileSync('git', ['status', '--short', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim();
assert.equal(changed, '', 'Preparation must not change production source');
console.log('StateReader JSON dependency preparation freezes legacy runtime construction and leaves production unwired.');
