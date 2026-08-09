const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../../src/application/community');
assert.equal(fs.existsSync(path.join(root, 'roadmapPublication/RoadmapPublicationPersistencePort.js')), false);
assert.equal(fs.existsSync(path.join(root, 'roadmapPublication/RoadmapPublicationStateRepository.js')), false);
console.log('Roadmap persistence request implementation adds no duplicate Port or repository');
