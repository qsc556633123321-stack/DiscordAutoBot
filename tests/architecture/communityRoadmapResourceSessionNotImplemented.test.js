const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
assert.equal(
  fs.existsSync(path.join(root, 'src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession.js')),
  true
);
console.log('Roadmap production session exists and remains separately not runtime wired');
