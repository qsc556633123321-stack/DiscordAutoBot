const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /mutationPort\.edit\(/);
assert.match(roadmap, /mutationPort\.send\(/);
assert.match(roadmap, /saveOnboarding\(guild\.id/);
assert.doesNotMatch(roadmap, /RoadmapPublicationMessageMutationAdapter|getRetainedMutationFailure/);
console.log('Roadmap runtime lookup redirect uses Pair mutation while persistence remains legacy-owned');
