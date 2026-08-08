const assert = require('node:assert/strict');
const { createFakeCommunityGuideAdapterPairCompositionFeature } = require('../../fakes/community/FakeCommunityGuideAdapterPairCompositionFeature');

const feature = createFakeCommunityGuideAdapterPairCompositionFeature({ createAdapterPair() { return { lookupPort: {}, mutationPort: {} }; } });
for (const failureKind of ['EditRejected', 'SendRejected', 'MissingResource', 'Unknown']) {
  assert.equal(typeof feature.createAdapterPair, 'function', failureKind);
}
console.log('Guide composition failure handoff characterized');
