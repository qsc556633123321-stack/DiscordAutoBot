const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');

assert.match(source, /communityGuideAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\)/);
assert.equal(source.includes('lookupPort.lookup'), true);
assert.equal(source.includes('mutationPort.edit'), true);
assert.equal(source.includes('mutationPort.send'), true);
console.log('Community guide runtime pair creation port-use guard passed');
