const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
for (const file of [
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js',
  'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js',
  'src/composition/communityRoadmapLookupFeature.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent during adapter preparation`);
}
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /RoadmapPublicationMessageLookupAdapter|RoadmapPublicationResourceSession/);
console.log('Roadmap adapter preparation has no production wiring');
