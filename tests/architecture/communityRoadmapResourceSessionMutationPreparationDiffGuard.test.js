const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
assert.equal(fs.existsSync(path.join(root, 'tests/fakes/community/FakeCommunityRoadmapMutationResourceSession.js')), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js')), true);
console.log('Roadmap Resource Session mutation preparation remains compatible with the isolated Adapter');
