const assert = require('node:assert/strict');
const { createCommunityGuideAdapterPairFeature } = require('../../src/composition/communityGuideAdapterPairFeature');

const calls = [];
const expectedPair = { lookupPort: {}, mutationPort: {} };
const createAdapterPair = (input) => { calls.push(input); return expectedPair; };

assert.throws(() => createCommunityGuideAdapterPairFeature({ createAdapterPair: null }), /requires createAdapterPair/);
const feature = createCommunityGuideAdapterPairFeature({ createAdapterPair });
assert.deepEqual(Object.keys(feature), ['createAdapterPair']);
assert.equal(feature.createAdapterPair, createAdapterPair);
assert.equal(calls.length, 0);
const input = { ensuredChannel: { id: 'guide-channel' } };
assert.equal(feature.createAdapterPair(input), expectedPair);
assert.deepEqual(calls, [input]);
assert.equal('session' in feature, false);
assert.equal('channel' in feature, false);
assert.equal('pair' in feature, false);
console.log('Community guide adapter pair composition feature passed');
