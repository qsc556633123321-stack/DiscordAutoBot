const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../src/composition/communityRoadmapAdapterPairFeature');

const feature = createCommunityRoadmapAdapterPairFeature();
assert.deepEqual(Object.keys(feature), ['createAdapterPair']);
for (const forbidden of ['lookupPort', 'getRetainedMessage', 'session', 'pair']) {
  assert.equal(forbidden in feature, false, `${forbidden} must not be public`);
}
console.log('Roadmap production composition surface is narrow');
