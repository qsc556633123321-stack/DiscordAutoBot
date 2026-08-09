const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-roadmap-composition-mutation-cases.json');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

assert.equal(fixture.cases.length, 40);
const pair = { lookupPort: {}, mutationPort: {}, getRetainedMessage() { return null; } };
let received;
const feature = createCommunityRoadmapAdapterPairFeature({ createAdapterPair(input) { received = input; return pair; } });
const input = { ensuredChannel: { id: 'roadmap' } };
assert.deepEqual(Object.keys(feature), ['createAdapterPair']);
assert.strictEqual(feature.createAdapterPair(input), pair);
assert.strictEqual(received, input);
console.log('Roadmap Composition mutation candidate preserves exact Pair and input identity');
