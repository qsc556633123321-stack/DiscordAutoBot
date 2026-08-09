const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

for (const file of [
  'src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js',
  'src/composition/communityRoadmapLookupFeature.js'
]) {
  assert.equal(fs.existsSync(path.resolve(__dirname, '../..', file)), false, `${file} must remain absent during preparation`);
}
console.log('Roadmap lookup port preparation has no production wiring');
