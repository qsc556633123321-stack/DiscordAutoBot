const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /communityRoadmapAdapterPairFeature|createCommunityRoadmapAdapterPairFeature/);
assert.doesNotMatch(runtime, /RoadmapPublicationAdapterPairFactory|RoadmapPublicationResourceSession/);
console.log('Roadmap runtime Pair creation preparation diff guard passed');
