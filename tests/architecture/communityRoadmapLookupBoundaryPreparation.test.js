const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /lookupPort\.lookup\(/);
assert.match(source, /channel\.messages\.fetch\(roadmapMessageId\)\.catch\(\(\) => null\)/);
console.log('Community Roadmap lookup boundary preparation passed');
