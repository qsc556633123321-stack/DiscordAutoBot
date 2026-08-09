const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), false);
console.log('Roadmap adapter pair composition remains absent');
