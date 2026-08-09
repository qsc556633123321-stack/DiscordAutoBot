const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../fakes/community/FakeCommunityRoadmapAdapterPairFeature.js'), 'utf8');
assert.match(source, /RoadmapPublicationAdapterPairFactory/);
assert.doesNotMatch(source, /RoadmapPublicationResourceSession|RoadmapPublicationMessageLookupAdapter/);
console.log('Roadmap composition candidate delegates only to Pair Factory');
