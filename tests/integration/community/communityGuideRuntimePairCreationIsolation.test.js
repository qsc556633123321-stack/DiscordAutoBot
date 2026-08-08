const assert = require('node:assert/strict');
const { createCommunityGuideAdapterPairFeature } = require('../../../src/composition/communityGuideAdapterPairFeature');

const channel = { id: 'guide', messages: { async fetch() { return { id: 'tracked', async edit() {} }; } }, async send() { return { id: 'sent' }; } };
const feature = createCommunityGuideAdapterPairFeature();
const pairA = feature.createAdapterPair({ ensuredChannel: channel });
const pairB = feature.createAdapterPair({ ensuredChannel: channel });
assert.notEqual(pairA, pairB);
assert.notEqual(pairA.lookupPort, pairB.lookupPort);
assert.notEqual(pairA.mutationPort, pairB.mutationPort);
console.log('Community guide runtime pair creation isolation characterized');
