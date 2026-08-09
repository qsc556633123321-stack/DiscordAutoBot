const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.doesNotMatch(source, /RoadmapPublicationAdapterPair|roadmapAdapterPair|roadmapLookupPort/);
console.log('Roadmap adapter pair runtime remains legacy-owned');
