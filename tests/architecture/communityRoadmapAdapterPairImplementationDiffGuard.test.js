const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), true);
assert.equal(
  fs.existsSync(path.join(root, 'src/application/community/roadmapPublication/RoadmapPublicationAdapterPair.js')),
  false,
  'Application Pair contract must remain absent'
);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /createRoadmapPublicationAdapterPair|RoadmapPublicationAdapterPair/);
console.log('Roadmap adapter pair implementation boundary passed');
