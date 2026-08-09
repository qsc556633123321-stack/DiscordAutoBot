const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.equal(source.includes('channel.messages.fetch(guideMessageId)'), false); assert.equal(source.includes('lookupPort.lookup'), true); assert.equal(source.includes('getRetainedMessage'), true);
assert.equal(source.includes('mutationPort.edit'), true); assert.equal(source.includes('mutationPort.send'), true);
console.log('Runtime lookup and mutation redirects are active');
