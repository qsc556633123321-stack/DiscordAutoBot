const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');

assert.match(source, /communityGuideAdapterPairFeature\.createAdapterPair\(\{ ensuredChannel: channel \}\)/);
assert.equal(/lookupPort|mutationPort/.test(source), false);
console.log('Community guide runtime pair creation no-port-use guard passed');
