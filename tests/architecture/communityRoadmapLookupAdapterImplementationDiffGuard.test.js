const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js')), true);
for (const file of [
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js',
  'src/composition/communityRoadmapLookupFeature.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent`);
}
console.log('Roadmap lookup adapter implementation boundary passed');
