const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /roadmapMessageId \? await channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\) : null/);
assert.doesNotMatch(source, /RoadmapPublicationMessageLookupPort|RoadmapLookupAdapter|roadmapLookupPort/);
console.log('Roadmap runtime lookup remains legacy-owned');
