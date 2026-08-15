const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.doesNotMatch(guide, /saveOnboarding\(/);
assert.match(guide, /createGuidePersistenceRequest/);
assert.match(guide, /communityGuidePersistenceFeature\.persist/);
assert.match(guide, /createCommunityGuidePersistenceFeature/);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 0);
assert.equal((runtime.match(/saveOnboarding\(guild\.id/g) || []).length, 0);
assert.doesNotMatch(roadmap, /saveOnboarding/);
console.log('Guide runtime persistence redirect remains active after helper cleanup.');
