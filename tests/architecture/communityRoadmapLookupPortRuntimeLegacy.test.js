const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /RoadmapPublicationMessageLookupPort/);
assert.match(source, /lookupPort\.lookupTrackedMessage/);
console.log('Roadmap runtime lookup uses the application port contract');
