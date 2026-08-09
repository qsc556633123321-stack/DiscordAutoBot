const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityRoadmapMutationFeature.js')), false);
console.log('Roadmap mutation Port implementation diff guard passed');
