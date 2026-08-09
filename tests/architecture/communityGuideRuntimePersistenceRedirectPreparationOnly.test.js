const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const guide = runtime.match(/async function setupCommunityGuide\(guild, options = \{\}\) \{([\s\S]*?)\n\}\n\nasync function setupRoadmapPanel/)[1];
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(guide, /saveOnboarding\(guild\.id, \{/);
assert.doesNotMatch(guide, /createGuidePersistenceRequest|communityGuidePersistenceFeature\.persist|createCommunityGuidePersistenceFeature/);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1);
assert.equal((runtime.match(/saveOnboarding\(guild\.id/g) || []).length, 1);
assert.doesNotMatch(roadmap, /saveOnboarding/);
console.log('Guide runtime persistence redirect remains preparation-only and saveOnboarding is still Guide-owned.');
