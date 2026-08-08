const assert = require('node:assert/strict');
const { createFakeCommunityGuideAdapterPairCompositionFeature } = require('../../fakes/community/FakeCommunityGuideAdapterPairCompositionFeature');

let roadmapCalls = 0;
const feature = createFakeCommunityGuideAdapterPairCompositionFeature({ createAdapterPair() { return { lookupPort: {}, mutationPort: {} }; } });
feature.createAdapterPair({ ensuredChannel: { id: 'guide' } });
assert.equal(roadmapCalls, 0);
console.log('Guide composition roadmap ordering characterized');
