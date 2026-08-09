const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtimePath = path.resolve(__dirname, '../../src/systems/communityConcierge.js');
const runtimeSource = fs.readFileSync(runtimePath, 'utf8');
const roadmapRuntime = runtimeSource.match(
  /async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/
)[1];

assert.match(roadmapRuntime, /mutationPort\.edit\(\{ messageId: message\.id, payload \}\)/);
assert.match(roadmapRuntime, /mutationPort\.send\(\{ payload \}\)/);
assert.doesNotMatch(roadmapRuntime, /RoadmapPublicationMessageMutationAdapter|RoadmapPublicationResourceSession|getRetainedMutationFailure/);
console.log('Roadmap redirect source guard preserves Pair-only mutation ownership');
