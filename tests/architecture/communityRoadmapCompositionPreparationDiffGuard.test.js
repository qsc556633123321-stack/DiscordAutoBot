const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/roadmapPublication/RoadmapPublicationAdapterPair.js')), false);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /communityRoadmapAdapterPairFeature|createRoadmapPublicationAdapterPair/);
console.log('Roadmap composition preparation diff guard passed');
