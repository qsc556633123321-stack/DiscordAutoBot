const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmapRuntime = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmapRuntime, /mutationPort\.edit\(/);
assert.match(roadmapRuntime, /mutationPort\.send\(/);
assert.doesNotMatch(roadmapRuntime, /RoadmapPublicationMessageMutationAdapter/);
console.log('Roadmap runtime mutation uses the existing Pair without direct Adapter access');
