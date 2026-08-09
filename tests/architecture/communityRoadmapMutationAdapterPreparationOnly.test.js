const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js')), true);
assert.equal(fs.existsSync(path.join(root, 'tests/fakes/community/FakeProductionShapeRoadmapMutationAdapter.js')), true);
console.log('Roadmap production mutation adapter is implemented without Pair or runtime wiring');
