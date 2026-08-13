const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
assert.match(roadmap, /message\.edit\(payload\)/);
assert.match(roadmap, /channel\.send\(payload\)/);
assert.doesNotMatch(roadmap, /saveOnboarding\(guild\.id/);
assert.doesNotMatch(roadmap, /RoadmapPublicationMessageMutationPort|RoadmapPublicationMessageMutationAdapter|mutationPort/);
console.log('Roadmap mutation remains legacy-owned during boundary preparation');
