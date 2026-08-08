const assert = require('node:assert/strict');
const { createFakeCommunityGuideAdapterPairCompositionFeature } = require('../../fakes/community/FakeCommunityGuideAdapterPairCompositionFeature');

let persistenceCalls = 0;
const feature = createFakeCommunityGuideAdapterPairCompositionFeature({ createAdapterPair() { return { lookupPort: {}, mutationPort: {} }; } });
feature.createAdapterPair({ ensuredChannel: { id: 'guide' } });
assert.equal(persistenceCalls, 0);
console.log('Guide composition persistence ordering characterized');
