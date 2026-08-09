const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(runtime, /communityRoadmapAdapterPairFeature|createCommunityRoadmapAdapterPairFeature|createRoadmapPublicationAdapterPair/);
console.log('Roadmap production composition is not runtime used');
