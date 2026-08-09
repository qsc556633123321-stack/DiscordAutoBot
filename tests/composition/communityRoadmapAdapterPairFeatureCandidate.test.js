const assert = require('node:assert/strict');
const fixture = require('../fixtures/community/community-roadmap-composition-cases.json');
const { createFakeCommunityRoadmapAdapterPairFeature } = require('../fakes/community/FakeCommunityRoadmapAdapterPairFeature');

assert.equal(fixture.cases.length, 30);
assert.throws(() => createFakeCommunityRoadmapAdapterPairFeature({ createAdapterPair: null }), /requires createAdapterPair/);
const calls = [];
const expectedPair = { lookupPort: {}, getRetainedMessage() { return null; } };
const feature = createFakeCommunityRoadmapAdapterPairFeature({
  createAdapterPair(input) {
    calls.push(input);
    return expectedPair;
  }
});
assert.deepEqual(Object.keys(feature), ['createAdapterPair']);
const input = { ensuredChannel: { id: 'roadmap' } };
assert.strictEqual(feature.createAdapterPair(input), expectedPair);
assert.strictEqual(calls[0], input);
assert.equal('session' in feature, false);
assert.equal('pair' in feature, false);
assert.equal('lookupPort' in feature, false);
console.log('Roadmap composition feature candidate passed');
