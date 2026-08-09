const assert = require('node:assert/strict'); const fs = require('node:fs'); const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');
assert.equal(source.includes('channel.messages.fetch(guideMessageId)'), false); assert.equal(source.includes('lookupPort.lookup'), true); assert.equal(source.includes('getRetainedMessage'), true);
assert.equal(source.includes('mutationPort.edit'), false); assert.equal(source.includes('mutationPort.send'), false);
console.log('Runtime lookup redirect is active while mutation remains legacy');
