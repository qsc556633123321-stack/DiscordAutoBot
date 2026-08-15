const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
const roadmap = source.match(/async function setupRoadmapPanel\(guild\) \{([\s\S]*?)\n\}\n\nasync function handleConciergeButton/)[1];
assert.match(roadmap, /lookupPort\.lookupTrackedMessage/);
assert.match(roadmap, /mutationPort\.edit|mutationPort\.send/);
assert.doesNotMatch(roadmap, /RoadmapPublicationMessageMutationAdapter/);
console.log('Roadmap runtime mutation Pair consumption remains narrow after redirect');
