const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const runtime = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /communityRoadmapAdapterPairFeature/);
assert.doesNotMatch(runtime, /createRoadmapPublicationAdapterPair/);
console.log('Roadmap lookup runtime remains legacy-owned after Pair creation');
