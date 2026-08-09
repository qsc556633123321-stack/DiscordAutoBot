const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/composition/communityRoadmapAdapterPairFeature.js'), 'utf8');
assert.doesNotMatch(source, /GuidePublication|GuideAdapter|GuideResourceSession/);
console.log('Roadmap production composition remains Guide-isolated');
