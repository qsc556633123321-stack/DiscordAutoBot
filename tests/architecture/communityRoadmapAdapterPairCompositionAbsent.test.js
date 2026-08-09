const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const composition = path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(fs.existsSync(composition), true);
assert.match(runtime, /communityRoadmapAdapterPairFeature/);
assert.doesNotMatch(runtime, /createRoadmapPublicationAdapterPair/);
console.log('Roadmap adapter pair composition is runtime-created without direct factory access');
