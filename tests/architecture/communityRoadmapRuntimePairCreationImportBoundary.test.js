const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /require\('\.\.\/composition\/communityRoadmapAdapterPairFeature'\)/);
assert.doesNotMatch(runtime, /RoadmapPublicationAdapterPairFactory|RoadmapPublicationResourceSession|RoadmapPublicationMessageLookupAdapter|RoadmapPublicationMessageLookupPort/);
console.log('Roadmap runtime imports Composition only');
