const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];

assert.match(roadmap, /mutationPort\.edit\(\{ messageId: message\.id, payload \}\)/);
assert.match(roadmap, /mutationPort\.send\(\{ payload \}\)/);
assert.doesNotMatch(roadmap, /await message\.edit\(payload\)|message = await channel\.send\(payload\)/);
assert.doesNotMatch(source, /RoadmapPublicationMessageMutationAdapter|RoadmapPublicationResourceSession|RoadmapPublicationMessageMutationPort/);
assert.doesNotMatch(roadmap, /getRetainedMutationFailure/);
console.log('Roadmap runtime mutation redirect has no legacy mutation bypass or direct adapter import');
