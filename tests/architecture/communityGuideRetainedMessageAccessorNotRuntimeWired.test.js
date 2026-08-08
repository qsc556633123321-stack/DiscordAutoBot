const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');

for (const forbidden of ['getRetainedMessage', 'lookupPort.lookup', 'mutationPort.edit', 'mutationPort.send']) assert.doesNotMatch(source, new RegExp(forbidden.replace('.', '\\.')));
assert.match(source, /channel\.messages\.fetch\(guideMessageId\)\.catch\(\(\) => null\)/);
console.log('Guide retained-message accessor remains runtime-unwired');
