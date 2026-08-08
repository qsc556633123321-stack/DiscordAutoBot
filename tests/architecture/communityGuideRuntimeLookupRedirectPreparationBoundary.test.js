const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.resolve(__dirname, '../../src/systems/communityConcierge.js'), 'utf8');

assert.match(source, /createCommunityGuideAdapterPairFeature/);
assert.match(source, /createAdapterPair\(\{ ensuredChannel: channel \}\)/);
assert.doesNotMatch(source, /lookupPort\.lookup\s*\(/);
assert.doesNotMatch(source, /mutationPort\.(?:edit|send)\s*\(/);
console.log('Community guide runtime lookup redirect preparation boundary passed');
