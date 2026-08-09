const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), true);
assert.match(runtime, /async function setupRoadmapPanel\(guild\)/);
assert.doesNotMatch(runtime, /RoadmapPublicationAdapterPairFactory|RoadmapPublicationResourceSession|RoadmapPublicationMessageLookupAdapter/);
console.log('Roadmap runtime Pair preparation architecture boundary passed');
