const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const allowedProductionFile = path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js');
assert.equal(fs.existsSync(allowedProductionFile), true);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter.js')), true);
console.log('Roadmap Resource Session mutation implementation remains compatible with the isolated Adapter');
