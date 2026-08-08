const assert = require('node:assert/strict');
const { createFakeCommunityGuideAdapterPairCompositionFeature } = require('../fakes/community/FakeCommunityGuideAdapterPairCompositionFeature');

(async () => {
  assert.throws(() => createFakeCommunityGuideAdapterPairCompositionFeature({ createAdapterPair: null }), /requires createAdapterPair/);
  const calls = [];
  const feature = createFakeCommunityGuideAdapterPairCompositionFeature({ createAdapterPair(input) { calls.push(input); return { lookupPort: {}, mutationPort: {} }; } });
  assert.deepEqual(Object.keys(feature), ['createAdapterPair']);
  const channel = { id: 'guide' };
  assert.deepEqual(feature.createAdapterPair({ ensuredChannel: channel }), { lookupPort: {}, mutationPort: {} });
  assert.deepEqual(calls, [{ ensuredChannel: channel }]);
  assert.equal('session' in feature, false); assert.equal('channel' in feature, false); assert.equal('pair' in feature, false);
  console.log('Guide adapter pair composition feature candidate preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
