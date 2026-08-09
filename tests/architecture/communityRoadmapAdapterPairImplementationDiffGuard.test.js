const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js')), true);
for (const file of [
  'src/composition/communityRoadmapAdapterPairFeature.js',
  'src/application/community/roadmapPublication/RoadmapPublicationAdapterPair.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent`);
}
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /createRoadmapPublicationAdapterPair|RoadmapPublicationAdapterPair/);
console.log('Roadmap adapter pair implementation boundary passed');
