const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
for (const flow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(flow), true);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3, 'one default reader per closed flow');
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3, 'one StateReader per closed flow');
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2, 'Guide and Roadmap retain default persistence construction');
assert.equal(runtime.includes('createCommunityOnboardingJsonReader({'), false);
console.log('Guide, Roadmap, and Welcome retain closed-flow reader construction through the default Infrastructure factory.');
