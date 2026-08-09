const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const roadmap = runtime.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function maybeAddRole/)[1];
const pair = fs.readFileSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js'), 'utf8');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js')), true);
assert.doesNotMatch(roadmap, /mutationPort\.edit|mutationPort\.send|RoadmapPublicationMessageMutationAdapter/);
assert.doesNotMatch(pair, /mutationPort|getRetainedMutationFailure/);
console.log('Roadmap mutation adapter implementation keeps Pair and runtime untouched');
