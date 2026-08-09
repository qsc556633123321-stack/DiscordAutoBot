const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

assert.equal(fs.existsSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory.js')), false);
assert.equal(fs.existsSync(path.resolve(__dirname, '../../src/composition/communityRoadmapLookupFeature.js')), false);
console.log('Roadmap lookup pair and composition remain absent');
