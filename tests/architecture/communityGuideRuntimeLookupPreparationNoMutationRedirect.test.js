const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');

assert.doesNotMatch(source, /mutationPort\.(?:edit|send)\s*\(/);
assert.match(source, /message\.edit\(payload\)/);
assert.match(source, /channel\.send\(payload\)/);
console.log('Community guide runtime lookup preparation no-mutation-redirect guard passed');
