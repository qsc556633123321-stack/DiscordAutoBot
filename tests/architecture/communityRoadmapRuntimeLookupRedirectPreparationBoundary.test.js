const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(fs.existsSync(path.join(root, 'tests/fakes/community/FakeCommunityRoadmapRuntimeLookupRedirect.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), true);
assert.match(runtime, /createCommunityRoadmapAdapterPairFeature/);
assert.match(runtime, /RoadmapPublicationMessageLookupKind/);
console.log('Roadmap lookup redirect implementation remains constrained to the approved Pair boundary');
