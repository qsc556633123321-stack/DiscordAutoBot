const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /lookupPort\.lookupTrackedMessage\(\{ messageId: roadmapMessageId \}\)/);
assert.doesNotMatch(source, /channel\.messages\.fetch\(roadmapMessageId\)/);
console.log('Roadmap mutation Port preparation preserves migrated lookup behavior');
