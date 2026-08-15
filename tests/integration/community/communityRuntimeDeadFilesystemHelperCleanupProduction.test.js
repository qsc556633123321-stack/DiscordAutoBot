const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');

for (const flow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(flow), true);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR \}\)/g) || []).length, 2, 'Guide and Roadmap persistence retain exact path construction');
console.log('Dead filesystem helper cleanup preserves Guide, Roadmap, Welcome reader construction and persistence path contracts.');
