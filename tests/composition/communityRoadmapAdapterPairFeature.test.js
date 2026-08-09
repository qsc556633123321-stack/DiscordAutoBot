const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../src/composition/communityRoadmapAdapterPairFeature');

function captureThrown(callback) {
  let threw = false;
  let caught;
  try {
    callback();
  } catch (error) {
    threw = true;
    caught = error;
  }
  assert.equal(threw, true);
  return caught;
}

assert.throws(() => createCommunityRoadmapAdapterPairFeature({ createAdapterPair: null }), /CommunityRoadmapAdapterPairFeature requires createAdapterPair/);
assert.deepEqual(Object.keys(createCommunityRoadmapAdapterPairFeature()), ['createAdapterPair']);

const calls = [];
const pair = { lookupPort: {}, getRetainedMessage() { return null; } };
const feature = createCommunityRoadmapAdapterPairFeature({
  createAdapterPair(input) {
    calls.push(input);
    return pair;
  }
});
const input = { ensuredChannel: { id: 'channel' } };
assert.strictEqual(feature.createAdapterPair(input), pair);
assert.strictEqual(calls[0], input);
assert.equal('pair' in feature, false);
assert.equal('session' in feature, false);

for (const thrown of [new Error('error'), 'string', 1, {}, null, undefined]) {
  const throwingFeature = createCommunityRoadmapAdapterPairFeature({ createAdapterPair() { throw thrown; } });
  assert.strictEqual(captureThrown(() => throwingFeature.createAdapterPair(input)), thrown);
}
console.log('Roadmap production composition feature passed');
