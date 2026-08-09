const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js')), true);
for (const file of ['src/composition/communityRoadmapLookupFeature.js']) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent`);
}
console.log('Roadmap lookup adapter implementation remains not runtime wired');
