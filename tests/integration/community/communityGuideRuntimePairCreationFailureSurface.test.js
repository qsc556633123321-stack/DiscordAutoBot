const assert = require('node:assert/strict');
const { createCommunityGuideAdapterPairFeature } = require('../../../src/composition/communityGuideAdapterPairFeature');

const feature = createCommunityGuideAdapterPairFeature();
assert.throws(() => feature.createAdapterPair({ ensuredChannel: null }), /ensured channel/);
assert.throws(() => feature.createAdapterPair({ ensuredChannel: { id: 'guide' } }), /channel\.messages\.fetch/);
console.log('Community guide runtime pair creation failure surface characterized');
