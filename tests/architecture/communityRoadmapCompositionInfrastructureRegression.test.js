const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
for (const file of [
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must remain available`);
}
console.log('Roadmap composition preparation preserves infrastructure boundaries');
