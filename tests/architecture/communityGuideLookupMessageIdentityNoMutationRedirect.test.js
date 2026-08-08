const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');

assert.match(source, /message\.edit\(payload\)/);
assert.match(source, /channel\.send\(payload\)/);
assert.doesNotMatch(source, /mutationPort\.(?:edit|send)\s*\(/);
console.log('Community guide lookup message identity no-mutation-redirect guard passed');
