const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
for (const file of [
  'src/composition/communityRoadmapAdapterPairFeature.js'
]) {
  assert.equal(fs.existsSync(path.join(root, file)), false, `${file} must remain absent during pair implementation`);
}
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js')), true);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /RoadmapPublicationAdapterPair|roadmapAdapterPair|roadmapLookupPort/);
console.log('Roadmap adapter pair preparation diff guard passed');
