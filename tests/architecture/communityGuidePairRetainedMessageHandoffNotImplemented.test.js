const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const pairFactory = fs.readFileSync(path.join(root, 'src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(pairFactory.includes('getRetainedMessage'), true);
assert.equal(runtime.includes('getRetainedMessage'), false);
assert.equal(runtime.includes('lookupPort.lookup'), false);
console.log('Community guide Pair retained-message handoff remains unimplemented in runtime');
