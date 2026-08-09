const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/composition/communityRoadmapAdapterPairFeature.js'), 'utf8');
assert.match(source, /RoadmapPublicationAdapterPairFactory/);
for (const forbidden of ['RoadmapPublicationResourceSession', 'RoadmapPublicationMessageLookupAdapter', 'RoadmapPublicationMessageLookupPort']) {
  assert.doesNotMatch(source, new RegExp(forbidden));
}
console.log('Roadmap production composition imports only Pair Factory');
