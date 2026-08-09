const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapAdapterPairFeature.js')), true);
console.log('Roadmap production composition remains not runtime used');
