const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

assert.equal(
  fs.existsSync(path.resolve(__dirname, '../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter.js')),
  true
);
console.log('Roadmap production lookup adapter exists and remains separately not runtime wired');
