const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');

assert.match(source, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
assert.doesNotMatch(source, /lookupPort\.lookup\s*\(/);
console.log('Community guide runtime lookup preparation legacy guard passed');
