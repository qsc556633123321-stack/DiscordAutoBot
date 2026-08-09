const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.equal(source.includes('channel.messages.fetch'), true); assert.equal(source.includes('lookupPort.lookup'), false); assert.equal(source.includes('getRetainedMessage'), false);
console.log('Runtime lookup redirect refresh remains preparation only');
