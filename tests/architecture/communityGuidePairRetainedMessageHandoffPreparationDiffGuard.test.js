const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const pairFactory = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8');

assert.equal(runtime.includes('channel.messages.fetch'), true);
assert.equal(runtime.includes('lookupPort.lookup'), false);
assert.equal(runtime.includes('mutationPort.'), false);
assert.equal(pairFactory.includes('return {\n    lookupPort'), true);
assert.equal(pairFactory.includes('getRetainedMessage'), true);
console.log('Community guide Pair retained-message preparation diff guard passed');
