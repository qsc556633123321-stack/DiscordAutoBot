const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');

const lookupPort = fs.readFileSync(path.join(root, 'src/application/community/ports/GuidePublicationMessageLookupPort.js'), 'utf8');
const mutationPort = fs.readFileSync(path.join(root, 'src/application/community/ports/GuidePublicationMessageMutationPort.js'), 'utf8');
assert.match(lookupPort, /lookup/);
assert.doesNotMatch(lookupPort, /edit|send/);
assert.match(mutationPort, /edit and send/);
assert.doesNotMatch(mutationPort, /lookup/);
console.log('Guide publication message lookup mutation adapter separation passed');
