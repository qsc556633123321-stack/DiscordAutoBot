const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

assert.equal(
  fs.existsSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js')),
  false
);
console.log('Roadmap lookup adapter remains absent');
